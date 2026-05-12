import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Eye, EyeOff, Loader, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../../services/api.js';
import { useAuthStore } from '../../contexts/authStore.js';

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore(s => s.setAuth);

  const strength = (() => {
    const p = form.password;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.signup(form);
      setAuth(data.user, data.token);
      toast.success('Account created! Welcome to SocialPilot 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const features = ['Unlimited AI content generation', 'Multiple brand workspaces', 'Content scheduling & history', 'Export to PDF, Markdown & JSON'];

  return (
    <div className="min-h-screen flex bg-surface-950">
      <div className="hidden lg:flex flex-1 flex-col justify-center p-12 bg-gradient-to-br from-accent-900 via-surface-900 to-brand-900">
        <div className="flex items-center gap-2 mb-12">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-white">SocialPilot</span>
        </div>
        <h2 className="font-display text-3xl font-bold text-white mb-3">Everything you need to win social media</h2>
        <p className="text-surface-400 mb-8">Start creating content in minutes, not hours.</p>
        <ul className="space-y-3">
          {features.map((f, i) => (
            <li key={i} className="flex items-center gap-3 text-surface-300">
              <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-green-400" />
              </div>
              {f}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white">SocialPilot</span>
          </div>

          <h1 className="font-display text-3xl font-bold text-white mb-2">Create your account</h1>
          <p className="text-surface-400 mb-8">Free forever. No credit card required.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Full name</label>
              <input type="text" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))}
                className="w-full px-4 py-3 bg-surface-800 border border-surface-700 rounded-xl text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
                placeholder="Alex Chen" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Work email</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))}
                className="w-full px-4 py-3 bg-surface-800 border border-surface-700 rounded-xl text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
                placeholder="alex@company.com" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))}
                  className="w-full px-4 py-3 pr-12 bg-surface-800 border border-surface-700 rounded-xl text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
                  placeholder="Min. 8 characters" required />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-white">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 flex gap-1">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strength ? ['bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500'][strength-1] : 'bg-surface-700'}`} />
                  ))}
                </div>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-white rounded-xl font-semibold transition-all">
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'Creating account...' : 'Create free account'}
            </button>
          </form>

          <p className="text-center text-surface-400 mt-6 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
