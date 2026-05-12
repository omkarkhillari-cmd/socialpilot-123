import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, FolderOpen, Sparkles, Trash2, Settings, MoreVertical, FileText, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { workspaceAPI } from '../../services/api.js';
import { WORKSPACE_COLORS, INDUSTRIES, formatRelative } from '../../utils/constants.js';
import { useAuthStore } from '../../contexts/authStore.js';

function WorkspaceCard({ workspace, onDelete }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="card group hover:shadow-lg hover:shadow-brand-500/5 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
      {/* Color stripe */}
      <div className="h-1.5" style={{ background: workspace.color || '#0ea5e9' }} />
      
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold"
              style={{ background: workspace.color || '#0ea5e9' }}>
              {workspace.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-display font-semibold text-surface-900 dark:text-white">{workspace.name}</h3>
              <p className="text-xs text-surface-400">{workspace.industry || 'General'}</p>
            </div>
          </div>
          
          <div className="relative">
            <button onClick={() => setMenuOpen(p => !p)}
              className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400">
              <MoreVertical className="w-4 h-4" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-8 z-20 w-44 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl shadow-lg overflow-hidden">
                  <button onClick={() => { navigate(`/dashboard/workspaces/${workspace.id}`); setMenuOpen(false); }}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700">
                    <Settings className="w-4 h-4" /> Edit workspace
                  </button>
                  <button onClick={() => { onDelete(workspace.id); setMenuOpen(false); }}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10">
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {workspace.description && (
          <p className="text-sm text-surface-500 dark:text-surface-400 mb-4 line-clamp-2">{workspace.description}</p>
        )}

        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-surface-400">
            <FileText className="w-3.5 h-3.5" />
            {workspace.contentCount || 0} posts
          </div>
          <div className="text-xs text-surface-400">
            Updated {formatRelative(workspace.updatedAt || workspace.createdAt)}
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={() => navigate(`/dashboard/workspaces/${workspace.id}/generate`)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors">
            <Sparkles className="w-3.5 h-3.5" /> Generate
          </button>
          <button onClick={() => navigate(`/dashboard/workspaces/${workspace.id}/history`)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 text-surface-700 dark:text-surface-200 rounded-lg text-sm font-medium transition-colors">
            <FileText className="w-3.5 h-3.5" /> History
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateWorkspaceModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    name: '', description: '', industry: '', brandVoice: '', targetAudience: '', website: '',
    color: WORKSPACE_COLORS[0]
  });
  const qc = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: (data) => workspaceAPI.create(data),
    onSuccess: (res) => {
      qc.invalidateQueries(['workspaces']);
      toast.success('Workspace created!');
      onCreated(res.data.workspace);
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to create workspace')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white dark:bg-surface-900 rounded-2xl shadow-2xl border border-surface-200 dark:border-surface-700 max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="p-6 border-b border-surface-200 dark:border-surface-700">
          <h2 className="font-display text-xl font-bold text-surface-900 dark:text-white">New Workspace</h2>
          <p className="text-sm text-surface-400 mt-1">Create a brand or project workspace</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Brand / Project Name *</label>
            <input value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))}
              className="input" placeholder="Acme Corp" required />
          </div>
          
          <div>
            <label className="label">Description</label>
            <textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))}
              className="input resize-none" rows={2} placeholder="What does this brand do?" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Industry</label>
              <select value={form.industry} onChange={e => setForm(p => ({...p, industry: e.target.value}))}
                className="input">
                <option value="">Select industry</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Website</label>
              <input value={form.website} onChange={e => setForm(p => ({...p, website: e.target.value}))}
                className="input" placeholder="https://..." type="url" />
            </div>
          </div>
          
          <div>
            <label className="label">Brand Voice</label>
            <textarea value={form.brandVoice} onChange={e => setForm(p => ({...p, brandVoice: e.target.value}))}
              className="input resize-none" rows={2} placeholder="Professional, innovative, customer-first..." />
          </div>
          
          <div>
            <label className="label">Target Audience</label>
            <input value={form.targetAudience} onChange={e => setForm(p => ({...p, targetAudience: e.target.value}))}
              className="input" placeholder="Marketing professionals aged 25-40" />
          </div>
          
          <div>
            <label className="label">Brand Color</label>
            <div className="flex flex-wrap gap-2">
              {WORKSPACE_COLORS.map(c => (
                <button key={c} type="button" onClick={() => setForm(p => ({...p, color: c}))}
                  className={`w-8 h-8 rounded-lg transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-surface-400 scale-110' : ''}`}
                  style={{ background: c }} />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1 justify-center">
              {mutation.isPending ? 'Creating...' : 'Create Workspace'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function WorkspacesPage() {
  const [showCreate, setShowCreate] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const user = useAuthStore(s => s.user);

  const { data, isLoading } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => workspaceAPI.list().then(r => r.data.workspaces)
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => workspaceAPI.delete(id),
    onSuccess: () => { qc.invalidateQueries(['workspaces']); toast.success('Workspace deleted'); },
    onError: () => toast.error('Failed to delete')
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-surface-900 dark:text-white">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">Manage your brand workspaces and content</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> New Workspace
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Workspaces', value: data?.length || 0, icon: FolderOpen, color: 'text-brand-500' },
          { label: 'Total Posts', value: data?.reduce((a, w) => a + (w.contentCount || 0), 0) || 0, icon: FileText, color: 'text-accent-500' },
          { label: 'Platforms', value: 5, icon: Sparkles, color: 'text-green-500' },
          { label: 'AI Models', value: 2, icon: Sparkles, color: 'text-orange-500' }
        ].map((stat, i) => (
          <div key={i} className="card p-4">
            <div className="flex items-center gap-3">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <div>
                <p className="text-2xl font-display font-bold text-surface-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-surface-400">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Workspaces grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="card p-5 h-48 shimmer" />)}
        </div>
      ) : data?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-4">
            <FolderOpen className="w-8 h-8 text-surface-400" />
          </div>
          <h3 className="font-display text-xl font-semibold text-surface-700 dark:text-surface-200 mb-2">No workspaces yet</h3>
          <p className="text-surface-400 mb-6">Create your first workspace to start generating content</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Create Workspace
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map(ws => (
            <WorkspaceCard key={ws.id} workspace={ws} onDelete={deleteMutation.mutate} />
          ))}
          <button onClick={() => setShowCreate(true)}
            className="card p-5 h-full min-h-[180px] flex flex-col items-center justify-center gap-3 border-dashed hover:border-brand-400 hover:bg-brand-50/50 dark:hover:bg-brand-500/5 transition-all group cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-surface-100 dark:bg-surface-700 group-hover:bg-brand-100 dark:group-hover:bg-brand-500/20 flex items-center justify-center transition-colors">
              <Plus className="w-6 h-6 text-surface-400 group-hover:text-brand-500 transition-colors" />
            </div>
            <div className="text-center">
              <p className="font-medium text-surface-600 dark:text-surface-400 group-hover:text-brand-500 transition-colors text-sm">Add Workspace</p>
              <p className="text-xs text-surface-400 mt-0.5">New brand or project</p>
            </div>
          </button>
        </div>
      )}

      {showCreate && (
        <CreateWorkspaceModal 
          onClose={() => setShowCreate(false)}
          onCreated={(ws) => { setShowCreate(false); navigate(`/dashboard/workspaces/${ws.id}/generate`); }}
        />
      )}
    </div>
  );
}
