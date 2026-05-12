import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Search, Filter, Trash2, Edit3, Check, RefreshCw,
  Download, Copy, MoreVertical, Sparkles, FileText, CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { contentAPI, aiAPI, exportAPI } from '../../services/api.js';
import { workspaceAPI } from '../../services/api.js';
import { PLATFORMS, TONES, CONTENT_TYPES, formatRelative, truncate, downloadFile, generatePDF } from '../../utils/constants.js';

function ContentCard({ item, workspace, onDelete, onApprove, onRefresh }) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(item.generatedContent);
  const [menuOpen, setMenuOpen] = useState(false);
  const qc = useQueryClient();

  const platform = PLATFORMS[item.platform] || { label: item.platform, emoji: '📝' };

  const updateMutation = useMutation({
    mutationFn: (data) => contentAPI.update(item.id, data),
    onSuccess: () => { qc.invalidateQueries(['content', item.workspaceId]); toast.success('Updated!'); setEditing(false); }
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(item.generatedContent);
    toast.success('Copied!');
  };

  const handleExportPDF = async () => {
    try { await generatePDF(item, workspace); }
    catch { toast.error('PDF export failed'); }
  };

  return (
    <div className="card overflow-hidden hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`badge ${platform.bgClass || 'bg-surface-200'} text-white text-xs`}>
            {platform.emoji} {platform.label}
          </span>
          <span className={`badge status-${item.status} text-xs`}>{item.status}</span>
          <span className="badge bg-surface-100 dark:bg-surface-700 text-surface-500 text-xs">
            {CONTENT_TYPES.find(t => t.key === item.contentType)?.label || item.contentType}
          </span>
        </div>
        <div className="relative flex items-center gap-1">
          <span className="text-xs text-surface-400">{formatRelative(item.createdAt)}</span>
          <button onClick={() => setMenuOpen(p => !p)}
            className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400">
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-8 z-20 w-48 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl shadow-lg overflow-hidden">
                <button onClick={() => { handleCopy(); setMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700">
                  <Copy className="w-4 h-4" /> Copy text
                </button>
                <button onClick={() => { setEditing(true); setMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700">
                  <Edit3 className="w-4 h-4" /> Edit
                </button>
                <button onClick={() => { handleExportPDF(); setMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700">
                  <Download className="w-4 h-4" /> Export PDF
                </button>
                {item.status !== 'approved' && (
                  <button onClick={() => { onApprove(item.id); setMenuOpen(false); }}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-green-600 hover:bg-green-50 dark:hover:bg-green-900/10">
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                )}
                <button onClick={() => { onDelete(item.id); setMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Topic */}
      <div className="px-4 pt-3">
        <p className="text-xs font-medium text-surface-400 mb-1">Topic</p>
        <p className="text-sm font-semibold text-surface-800 dark:text-surface-200">{item.topic}</p>
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        {editing ? (
          <div className="space-y-2">
            <textarea value={editText} onChange={e => setEditText(e.target.value)}
              className="input resize-none w-full" rows={6} />
            <div className="flex gap-2">
              <button onClick={() => updateMutation.mutate({ generatedContent: editText })}
                disabled={updateMutation.isPending}
                className="btn-primary text-xs py-1.5 px-3">
                <Check className="w-3.5 h-3.5" /> Save
              </button>
              <button onClick={() => { setEditing(false); setEditText(item.generatedContent); }}
                className="btn-secondary text-xs py-1.5 px-3">Cancel</button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-surface-600 dark:text-surface-400 whitespace-pre-wrap leading-relaxed">
              {expanded ? item.generatedContent : truncate(item.generatedContent, 200)}
            </p>
            {item.generatedContent?.length > 200 && (
              <button onClick={() => setExpanded(p => !p)} className="text-xs text-brand-500 hover:text-brand-400 mt-1 font-medium">
                {expanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 px-4 pb-4">
        <button onClick={handleCopy} className="btn-ghost text-xs py-1.5 px-3">
          <Copy className="w-3.5 h-3.5" /> Copy
        </button>
        <button onClick={() => onRefresh(item)} className="btn-ghost text-xs py-1.5 px-3">
          <RefreshCw className="w-3.5 h-3.5" /> Regenerate
        </button>
        {item.status !== 'approved' && (
          <button onClick={() => onApprove(item.id)}
            className="btn-ghost text-xs py-1.5 px-3 text-green-600 hover:text-green-700">
            <CheckCircle className="w-3.5 h-3.5" /> Approve
          </button>
        )}
      </div>
    </div>
  );
}

export default function ContentHistory() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [search, setSearch] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');

  const { data: workspace } = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: () => workspaceAPI.get(workspaceId).then(r => r.data.workspace)
  });

  const { data, isLoading } = useQuery({
    queryKey: ['content', workspaceId, { search, filterPlatform, filterStatus, filterType }],
    queryFn: () => contentAPI.list(workspaceId, {
      search, platform: filterPlatform, status: filterStatus, contentType: filterType
    }).then(r => r.data)
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => contentAPI.delete(id),
    onSuccess: () => { qc.invalidateQueries(['content', workspaceId]); toast.success('Deleted'); }
  });

  const approveMutation = useMutation({
    mutationFn: (id) => contentAPI.approve(id),
    onSuccess: () => { qc.invalidateQueries(['content', workspaceId]); toast.success('Approved!'); }
  });

  const regenMutation = useMutation({
    mutationFn: (id) => aiAPI.regenerate(id),
    onSuccess: () => { qc.invalidateQueries(['content', workspaceId]); toast.success('Regenerated!'); }
  });

  const handleExportMarkdown = async () => {
    try {
      const res = await exportAPI.markdown(workspaceId);
      downloadFile(res.data, `${workspace?.name || 'content'}-export.md`);
      toast.success('Exported as Markdown!');
    } catch { toast.error('Export failed'); }
  };

  const handleExportJSON = async () => {
    try {
      const res = await exportAPI.json(workspaceId);
      downloadFile(res.data, `${workspace?.name || 'content'}-export.json`);
      toast.success('Exported as JSON!');
    } catch { toast.error('Export failed'); }
  };

  const items = data?.items || [];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-ghost p-2">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-display text-xl font-bold text-surface-900 dark:text-white">Content History</h1>
            <p className="text-sm text-surface-400">{workspace?.name} · {data?.total || 0} items</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="relative flex items-center">
            <button className="btn-secondary text-sm py-2 gap-1.5">
              <Download className="w-4 h-4" /> Export
              <span>▾</span>
            </button>
            <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl shadow-lg overflow-hidden z-10 hidden group-hover:block">
            </div>
          </div>
          <button onClick={handleExportMarkdown} className="btn-secondary text-sm py-2">
            <Download className="w-4 h-4" /> .md
          </button>
          <button onClick={handleExportJSON} className="btn-secondary text-sm py-2">
            <Download className="w-4 h-4" /> .json
          </button>
          <Link to={`/dashboard/workspaces/${workspaceId}/generate`} className="btn-primary text-sm py-2">
            <Sparkles className="w-4 h-4" /> Generate
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="input pl-9 py-2" placeholder="Search content..." />
        </div>
        <select value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)} className="input py-2 w-auto">
          <option value="">All platforms</option>
          {Object.values(PLATFORMS).map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input py-2 w-auto">
          <option value="">All statuses</option>
          {['draft', 'approved', 'published', 'archived'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="input py-2 w-auto">
          <option value="">All types</option>
          {CONTENT_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
        </select>
      </div>

      {/* Content grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="card p-5 h-48 shimmer" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-surface-400" />
          </div>
          <h3 className="font-display text-xl font-semibold text-surface-700 dark:text-surface-200 mb-2">No content yet</h3>
          <p className="text-surface-400 mb-6">Generate your first piece of content to see it here</p>
          <Link to={`/dashboard/workspaces/${workspaceId}/generate`} className="btn-primary">
            <Sparkles className="w-4 h-4" /> Generate Content
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map(item => (
            <ContentCard key={item.id} item={item} workspace={workspace}
              onDelete={deleteMutation.mutate}
              onApprove={approveMutation.mutate}
              onRefresh={(item) => regenMutation.mutate(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
