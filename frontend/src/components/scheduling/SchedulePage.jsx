import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Calendar, Clock, Trash2, Edit3, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isBefore, parseISO } from 'date-fns';
import { scheduleAPI, contentAPI, workspaceAPI } from '../../services/api.js';
import { PLATFORMS, formatDate } from '../../utils/constants.js';

function CalendarView({ posts, currentMonth, onDayClick }) {
  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const firstDay = startOfMonth(currentMonth).getDay();

  const getPostsForDay = (day) => posts.filter(p => isSameDay(parseISO(p.scheduledAt), day));

  return (
    <div className="card overflow-hidden">
      <div className="p-4 border-b border-surface-200 dark:border-surface-700">
        <h3 className="font-display font-semibold text-surface-900 dark:text-white">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
      </div>
      <div className="p-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-xs font-semibold text-surface-400 py-2">{d}</div>
          ))}
        </div>
        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
          {days.map(day => {
            const dayPosts = getPostsForDay(day);
            const past = isBefore(day, new Date()) && !isToday(day);
            return (
              <button key={day.toISOString()} onClick={() => onDayClick(day)}
                className={`aspect-square flex flex-col items-center justify-start p-1 rounded-xl text-xs transition-all hover:bg-surface-100 dark:hover:bg-surface-700 ${
                  isToday(day) ? 'bg-brand-500 text-white hover:bg-brand-600' : 
                  past ? 'opacity-40' : 'text-surface-700 dark:text-surface-300'
                }`}>
                <span className="font-medium">{format(day, 'd')}</span>
                {dayPosts.length > 0 && (
                  <div className="flex flex-wrap gap-0.5 mt-0.5 justify-center">
                    {dayPosts.slice(0, 3).map((p, i) => (
                      <span key={i} className={`w-1.5 h-1.5 rounded-full ${PLATFORMS[p.platform]?.bgClass || 'bg-brand-500'} ${isToday(day) ? 'bg-white' : ''}`} />
                    ))}
                    {dayPosts.length > 3 && <span className={`text-xs ${isToday(day) ? 'text-white/80' : 'text-surface-400'}`}>+{dayPosts.length - 3}</span>}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ScheduleModal({ workspaceId, selectedDate, contentItems, onClose, onScheduled }) {
  const [form, setForm] = useState({
    platform: 'instagram',
    content: '',
    scheduledAt: selectedDate ? `${format(selectedDate, 'yyyy-MM-dd')}T09:00` : '',
    title: '',
    contentId: ''
  });

  const mutation = useMutation({
    mutationFn: (data) => scheduleAPI.create({ ...data, workspaceId, scheduledAt: new Date(data.scheduledAt).toISOString() }),
    onSuccess: (res) => { toast.success('Post scheduled!'); onScheduled(res.data.post); }
  });

  const handleContentSelect = (e) => {
    const id = e.target.value;
    if (id) {
      const item = contentItems.find(i => i.id === id);
      if (item) setForm(p => ({ ...p, contentId: id, content: item.generatedContent, platform: item.platform }));
    } else {
      setForm(p => ({ ...p, contentId: '', content: '' }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-surface-900 rounded-2xl shadow-2xl border border-surface-200 dark:border-surface-700 animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-surface-200 dark:border-surface-700">
          <h3 className="font-display font-bold text-surface-900 dark:text-white">Schedule Post</h3>
          <button onClick={onClose} className="btn-ghost p-2"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          {contentItems?.length > 0 && (
            <div>
              <label className="label">Use saved content (optional)</label>
              <select value={form.contentId} onChange={handleContentSelect} className="input">
                <option value="">Write custom content</option>
                {contentItems.map(i => (
                  <option key={i.id} value={i.id}>
                    [{PLATFORMS[i.platform]?.label || i.platform}] {i.topic?.slice(0, 40)}...
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="label">Platform</label>
            <select value={form.platform} onChange={e => setForm(p => ({...p, platform: e.target.value}))} className="input">
              {Object.values(PLATFORMS).map(p => <option key={p.key} value={p.key}>{p.emoji} {p.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Post Content *</label>
            <textarea value={form.content} onChange={e => setForm(p => ({...p, content: e.target.value}))}
              className="input resize-none" rows={4} placeholder="Your post content..." required />
          </div>
          <div>
            <label className="label">Schedule Date & Time *</label>
            <input type="datetime-local" value={form.scheduledAt} onChange={e => setForm(p => ({...p, scheduledAt: e.target.value}))}
              className="input" required />
          </div>
          <div>
            <label className="label">Title / Note</label>
            <input value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))}
              className="input" placeholder="Optional label for this post" />
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-surface-200 dark:border-surface-700">
          <button onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button onClick={() => mutation.mutate(form)} disabled={mutation.isPending || !form.content || !form.scheduledAt}
            className="btn-primary flex-1 justify-center">
            {mutation.isPending ? 'Scheduling...' : 'Schedule Post'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SchedulePage() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const { data: workspace } = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: () => workspaceAPI.get(workspaceId).then(r => r.data.workspace)
  });

  const { data: scheduledData } = useQuery({
    queryKey: ['schedule', workspaceId],
    queryFn: () => scheduleAPI.list(workspaceId).then(r => r.data)
  });

  const { data: contentData } = useQuery({
    queryKey: ['content', workspaceId],
    queryFn: () => contentAPI.list(workspaceId, { status: 'approved' }).then(r => r.data)
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => scheduleAPI.delete(id),
    onSuccess: () => { qc.invalidateQueries(['schedule', workspaceId]); toast.success('Removed'); }
  });

  const posts = scheduledData?.posts || [];
  const dayPosts = selectedDay ? posts.filter(p => isSameDay(parseISO(p.scheduledAt), selectedDay)) : [];

  const upcoming = [...posts]
    .filter(p => !isBefore(parseISO(p.scheduledAt), new Date()))
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
    .slice(0, 10);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-ghost p-2"><ArrowLeft className="w-4 h-4" /></button>
          <div>
            <h1 className="font-display text-xl font-bold text-surface-900 dark:text-white">Content Schedule</h1>
            <p className="text-sm text-surface-400">{workspace?.name} · {posts.length} scheduled</p>
          </div>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Schedule Post
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <button onClick={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() - 1))}
              className="btn-ghost py-1.5 px-3 text-sm">← Prev</button>
            <span className="font-display font-semibold text-surface-700 dark:text-surface-200">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button onClick={() => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth() + 1))}
              className="btn-ghost py-1.5 px-3 text-sm">Next →</button>
          </div>
          <CalendarView posts={posts} currentMonth={currentMonth} onDayClick={(day) => { setSelectedDay(day); }} />

          {/* Selected day posts */}
          {selectedDay && dayPosts.length > 0 && (
            <div className="card p-4">
              <h3 className="font-display font-semibold text-surface-900 dark:text-white mb-3">
                {format(selectedDay, 'MMMM d')} · {dayPosts.length} post{dayPosts.length > 1 ? 's' : ''}
              </h3>
              <div className="space-y-2">
                {dayPosts.map(post => (
                  <div key={post.id} className="flex items-start gap-3 p-3 bg-surface-50 dark:bg-surface-800 rounded-xl">
                    <span className={`badge ${PLATFORMS[post.platform]?.bgClass || 'bg-surface-200'} text-white text-xs flex-shrink-0`}>
                      {PLATFORMS[post.platform]?.emoji}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-surface-500 dark:text-surface-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {format(parseISO(post.scheduledAt), 'h:mm a')}
                      </p>
                      <p className="text-sm text-surface-700 dark:text-surface-300 line-clamp-2 mt-0.5">{post.content}</p>
                    </div>
                    <button onClick={() => deleteMutation.mutate(post.id)}
                      className="text-surface-400 hover:text-red-500 transition-colors flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Upcoming */}
        <div className="space-y-4">
          <div className="card p-4">
            <h3 className="font-display font-semibold text-surface-900 dark:text-white mb-4">Upcoming Posts</h3>
            {upcoming.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-8 h-8 text-surface-300 mx-auto mb-2" />
                <p className="text-sm text-surface-400">No upcoming posts</p>
                <button onClick={() => setShowModal(true)} className="btn-primary text-xs py-1.5 px-3 mt-3">
                  <Plus className="w-3.5 h-3.5" /> Schedule
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.map(post => (
                  <div key={post.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs flex-shrink-0 bg-gradient-to-br ${PLATFORMS[post.platform]?.gradient || 'from-brand-500 to-brand-600'}`}>
                      {PLATFORMS[post.platform]?.emoji || '📝'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-brand-500 mb-0.5">
                        {format(parseISO(post.scheduledAt), 'MMM d, h:mm a')}
                      </p>
                      <p className="text-xs text-surface-600 dark:text-surface-400 line-clamp-2">{post.content}</p>
                      {post.title && <p className="text-xs text-surface-400 mt-0.5 italic">{post.title}</p>}
                    </div>
                    <button onClick={() => deleteMutation.mutate(post.id)}
                      className="text-surface-300 hover:text-red-400 transition-colors flex-shrink-0">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="card p-4">
            <h3 className="font-display font-semibold text-surface-900 dark:text-white mb-3">Platform Breakdown</h3>
            <div className="space-y-2">
              {Object.values(PLATFORMS).map(p => {
                const count = posts.filter(post => post.platform === p.key).length;
                if (!count) return null;
                return (
                  <div key={p.key} className="flex items-center gap-2">
                    <span className="text-sm">{p.emoji}</span>
                    <span className="text-xs text-surface-600 dark:text-surface-400 flex-1">{p.label}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 rounded-full bg-surface-100 dark:bg-surface-700 w-16">
                        <div className="h-full rounded-full bg-brand-500" style={{ width: `${(count / posts.length) * 100}%` }} />
                      </div>
                      <span className="text-xs font-medium text-surface-500 w-4 text-right">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <ScheduleModal
          workspaceId={workspaceId}
          selectedDate={selectedDay}
          contentItems={contentData?.items || []}
          onClose={() => setShowModal(false)}
          onScheduled={() => { qc.invalidateQueries(['schedule', workspaceId]); setShowModal(false); }}
        />
      )}
    </div>
  );
}
