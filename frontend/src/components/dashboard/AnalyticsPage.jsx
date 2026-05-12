import { useQuery } from '@tanstack/react-query';
import { workspaceAPI, contentAPI } from '../../services/api.js';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { TrendingUp, FileText, CheckCircle, Clock, Sparkles, BarChart2 } from 'lucide-react';
import { PLATFORMS, CONTENT_TYPES } from '../../utils/constants.js';

const COLORS = ['#0ea5e9', '#d946ef', '#10b981', '#f97316', '#8b5cf6', '#f43f5e'];

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-2xl font-display font-bold text-surface-900 dark:text-white">{value}</p>
          <p className="text-xs text-surface-400">{label}</p>
          {sub && <p className="text-xs text-green-500 font-medium">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: workspacesData } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => workspaceAPI.list().then(r => r.data.workspaces)
  });

  const workspaces = workspacesData || [];

  // Fetch content for all workspaces
  const contentQueries = useQuery({
    queryKey: ['all-content-analytics', workspaces.map(w => w.id)],
    queryFn: async () => {
      if (!workspaces.length) return [];
      const results = await Promise.all(
        workspaces.map(w => contentAPI.list(w.id).then(r => r.data.items))
      );
      return results.flat();
    },
    enabled: workspaces.length > 0
  });

  const allContent = contentQueries.data || [];
  const totalContent = allContent.length;
  const approved = allContent.filter(c => c.status === 'approved').length;
  const drafts = allContent.filter(c => c.status === 'draft').length;
  const totalWorkspaces = workspaces.length;

  // Platform distribution
  const platformData = Object.values(PLATFORMS).map(p => ({
    name: p.label.split('/')[0],
    count: allContent.filter(c => c.platform === p.key).length,
    fill: p.color
  })).filter(d => d.count > 0);

  // Content type distribution
  const typeData = CONTENT_TYPES.map(t => ({
    name: t.label,
    count: allContent.filter(c => c.contentType === t.key).length
  })).filter(d => d.count > 0);

  // Content over time (last 14 days)
  const timelineData = (() => {
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      days.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: allContent.filter(c => c.createdAt?.slice(0, 10) === dateStr).length
      });
    }
    return days;
  })();

  // Workspace content breakdown
  const workspaceData = workspaces.map(w => ({
    name: w.name.length > 12 ? w.name.slice(0, 12) + '…' : w.name,
    posts: w.contentCount || 0
  })).sort((a, b) => b.posts - a.posts).slice(0, 8);

  // Tone distribution
  const toneData = (() => {
    const tones = {};
    allContent.forEach(c => {
      if (c.tone) tones[c.tone] = (tones[c.tone] || 0) + 1;
    });
    return Object.entries(tones).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  })();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl p-3 shadow-lg text-xs">
          <p className="font-semibold text-surface-700 dark:text-surface-200 mb-1">{label}</p>
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color || '#0ea5e9' }}>{p.name}: <strong>{p.value}</strong></p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-surface-900 dark:text-white">Analytics</h1>
        <p className="text-surface-400 mt-1">Content performance across all workspaces</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={FileText} label="Total Content" value={totalContent} color="bg-brand-500" />
        <StatCard icon={CheckCircle} label="Approved" value={approved}
          sub={totalContent ? `${Math.round((approved/totalContent)*100)}% approval rate` : undefined}
          color="bg-green-500" />
        <StatCard icon={Clock} label="Drafts" value={drafts} color="bg-orange-400" />
        <StatCard icon={Sparkles} label="Workspaces" value={totalWorkspaces} color="bg-accent-500" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Timeline */}
        <div className="lg:col-span-2 card p-5">
          <h3 className="font-display font-semibold text-surface-900 dark:text-white mb-4">Content Generated (Last 14 Days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="count" name="Posts" stroke="#0ea5e9" strokeWidth={2.5}
                dot={{ fill: '#0ea5e9', r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Platform pie */}
        <div className="card p-5">
          <h3 className="font-display font-semibold text-surface-900 dark:text-white mb-4">By Platform</h3>
          {platformData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={platformData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                    dataKey="count" paddingAngle={3}>
                    {platformData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill || COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {platformData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-surface-600 dark:text-surface-400">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.fill || COLORS[i % COLORS.length] }} />
                      {d.name}
                    </span>
                    <span className="font-semibold text-surface-700 dark:text-surface-300">{d.count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-40 text-surface-400 text-sm">No data yet</div>
          )}
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Workspace breakdown */}
        <div className="card p-5">
          <h3 className="font-display font-semibold text-surface-900 dark:text-white mb-4">Posts by Workspace</h3>
          {workspaceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={workspaceData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="posts" name="Posts" fill="#0ea5e9" radius={[0, 4, 4, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-40 text-surface-400 text-sm">No data yet</div>
          )}
        </div>

        {/* Content type + Tone */}
        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="font-display font-semibold text-surface-900 dark:text-white mb-4">Content Types</h3>
            {typeData.length > 0 ? (
              <div className="space-y-2">
                {typeData.map((t, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-surface-500 dark:text-surface-400 w-20 truncate">{t.name}</span>
                    <div className="flex-1 h-2 bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-accent-500 transition-all"
                        style={{ width: `${Math.max(4, (t.count / Math.max(...typeData.map(d => d.count))) * 100)}%`, background: COLORS[i % COLORS.length] }} />
                    </div>
                    <span className="text-xs font-semibold text-surface-600 dark:text-surface-400 w-5 text-right">{t.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-surface-400 text-sm text-center py-4">No data yet</p>
            )}
          </div>

          <div className="card p-5">
            <h3 className="font-display font-semibold text-surface-900 dark:text-white mb-4">Top Tones Used</h3>
            {toneData.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {toneData.slice(0, 8).map((t, i) => (
                  <span key={i} className="badge text-xs font-medium"
                    style={{ background: `${COLORS[i % COLORS.length]}20`, color: COLORS[i % COLORS.length] }}>
                    {t.name} · {t.count}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-surface-400 text-sm text-center py-4">No data yet</p>
            )}
          </div>
        </div>
      </div>

      {totalContent === 0 && (
        <div className="card p-12 text-center">
          <BarChart2 className="w-12 h-12 text-surface-300 dark:text-surface-600 mx-auto mb-4" />
          <h3 className="font-display text-xl font-semibold text-surface-700 dark:text-surface-300 mb-2">No analytics yet</h3>
          <p className="text-surface-400">Start generating content to see your analytics here.</p>
        </div>
      )}
    </div>
  );
}
