import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Eye, EyeOff, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../../services/api.js';
import { useAuthStore } from '../../contexts/authStore.js';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore(s => s.setAuth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.login(form);
      setAuth(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setForm({ email: 'demo@socialpilot.ai', password: 'demo1234' });
    toast('Demo credentials filled!', { icon: '💡' });
  };

  return (
    <div className="min-h-screen flex bg-surface-950">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 bg-gradient-to-br from-brand-900 via-surface-900 to-accent-900">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-white">SocialPilot</span>
        </div>
        
        <div>
          <blockquote className="text-2xl font-display font-medium text-white/90 leading-relaxed mb-6">
            "Create a month of social media content in the time it used to take to write one post."
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-500/30 flex items-center justify-center text-white font-semibold">A</div>
            <div>
              <div className="text-white font-medium text-sm">Alex Chen</div>
              <div className="text-surface-400 text-xs">Head of Marketing, TechCorp</div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          {['Instagram', 'LinkedIn', 'Twitter', 'TikTok'].map(p => (
            <span key={p} className="px-3 py-1.5 bg-white/10 rounded-full text-white/70 text-xs font-medium">{p}</span>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white">SocialPilot</span>
          </div>

          <h1 className="font-display text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-surface-400 mb-8">Sign in to your content studio</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                className="w-full px-4 py-3 bg-surface-800 border border-surface-700 rounded-xl text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
                placeholder="you@company.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="w-full px-4 py-3 pr-12 bg-surface-800 border border-surface-700 rounded-xl text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all"
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-white transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-brand-500 hover:bg-brand-400 disabled:opacity-50 text-white rounded-xl font-semibold transition-all">
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <button onClick={fillDemo} className="mt-3 w-full py-3 bg-surface-800 hover:bg-surface-700 text-surface-300 rounded-xl text-sm font-medium transition-all border border-surface-700">
            Try with demo account
          </button>

          <p className="text-center text-surface-400 mt-6 text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-brand-400 hover:text-brand-300 font-medium">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
