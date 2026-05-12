import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, Sparkles, FileText, Calendar, Download, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { workspaceAPI } from '../../services/api.js';
import { INDUSTRIES, WORKSPACE_COLORS } from '../../utils/constants.js';

export default function WorkspaceDetail() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: () => workspaceAPI.get(workspaceId).then(r => r.data.workspace)
  });

  const [form, setForm] = useState(null);

  // Sync form when data loads
  if (data && !form) setForm({ ...data });

  const updateMutation = useMutation({
    mutationFn: (d) => workspaceAPI.update(workspaceId, d),
    onSuccess: () => { qc.invalidateQueries(['workspace', workspaceId]); toast.success('Saved!'); }
  });

  const deleteMutation = useMutation({
    mutationFn: () => workspaceAPI.delete(workspaceId),
    onSuccess: () => { qc.invalidateQueries(['workspaces']); toast.success('Deleted'); navigate('/dashboard/workspaces'); }
  });

  if (isLoading || !form) return (
    <div className="p-8">
      <div className="h-8 w-48 shimmer rounded-lg mb-6" />
      <div className="card p-6 space-y-4">
        {[1,2,3,4].map(i => <div key={i} className="h-12 shimmer rounded-xl" />)}
      </div>
    </div>
  );

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="btn-ghost p-2">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="font-display text-xl font-bold text-surface-900 dark:text-white">Workspace Settings</h1>
          <p className="text-sm text-surface-400">{data.name}</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { icon: Sparkles, label: 'Generate', path: `/dashboard/workspaces/${workspaceId}/generate`, color: 'text-brand-500' },
          { icon: FileText, label: 'History', path: `/dashboard/workspaces/${workspaceId}/history`, color: 'text-accent-500' },
          { icon: Calendar, label: 'Schedule', path: `/dashboard/workspaces/${workspaceId}/schedule`, color: 'text-green-500' }
        ].map(({ icon: Icon, label, path, color }) => (
          <Link key={path} to={path} className="card p-4 flex flex-col items-center gap-2 hover:shadow-md transition-all">
            <Icon className={`w-5 h-5 ${color}`} />
            <span className="text-xs font-medium text-surface-600 dark:text-surface-400">{label}</span>
          </Link>
        ))}
      </div>

      {/* Edit form */}
      <div className="card p-6">
        <h2 className="font-display font-semibold text-surface-900 dark:text-white mb-5">Brand Details</h2>
        
        <div className="space-y-4">
          <div>
            <label className="label">Name *</label>
            <input value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))}
              className="input" placeholder="Brand name" />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea value={form.description || ''} onChange={e => setForm(p => ({...p, description: e.target.value}))}
              className="input resize-none" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Industry</label>
              <select value={form.industry || ''} onChange={e => setForm(p => ({...p, industry: e.target.value}))}
                className="input">
                <option value="">Select...</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Website</label>
              <input value={form.website || ''} onChange={e => setForm(p => ({...p, website: e.target.value}))}
                className="input" type="url" placeholder="https://..." />
            </div>
          </div>
          <div>
            <label className="label">Brand Voice</label>
            <textarea value={form.brandVoice || ''} onChange={e => setForm(p => ({...p, brandVoice: e.target.value}))}
              className="input resize-none" rows={2} placeholder="Describe your brand voice..." />
          </div>
          <div>
            <label className="label">Target Audience</label>
            <input value={form.targetAudience || ''} onChange={e => setForm(p => ({...p, targetAudience: e.target.value}))}
              className="input" placeholder="Who is your ideal customer?" />
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
            <button onClick={() => updateMutation.mutate(form)} disabled={updateMutation.isPending}
              className="btn-primary flex-1 justify-center">
              <Save className="w-4 h-4" /> {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
            <button onClick={() => { if (confirm('Delete this workspace?')) deleteMutation.mutate(); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 text-red-600 rounded-xl font-medium transition-all">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
