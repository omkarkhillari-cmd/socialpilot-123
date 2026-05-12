import { Link } from 'react-router-dom';
import { Zap, Sparkles, BarChart2, Calendar, Download, Shield } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-950 text-white overflow-hidden">
      {/* Gradient blobs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-accent-500/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-brand-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Nav */}
        <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-white">SocialPilot</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 text-surface-300 hover:text-white transition-colors font-medium">
              Sign in
            </Link>
            <Link to="/signup" className="px-5 py-2.5 bg-brand-500 hover:bg-brand-400 text-white rounded-xl font-medium transition-colors">
              Get started free
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="text-center py-24 px-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/10 border border-brand-500/20 rounded-full text-brand-400 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            Powered by Google Gemini AI
          </div>
          
          <h1 className="font-display text-6xl md:text-7xl font-bold mb-6 leading-tight">
            Your AI Social Media
            <span className="block bg-gradient-to-r from-brand-400 to-accent-400 bg-clip-text text-transparent">
              Content Studio
            </span>
          </h1>
          
          <p className="text-xl text-surface-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Generate platform-perfect posts, captions, threads, and campaigns in seconds. 
            From Instagram to LinkedIn — all powered by Gemini AI.
          </p>
          
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/signup" className="px-8 py-4 bg-brand-500 hover:bg-brand-400 text-white rounded-xl font-semibold text-lg transition-all hover:shadow-lg hover:shadow-brand-500/25">
              Start creating for free
            </Link>
            <Link to="/login" className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-semibold text-lg transition-all">
              Sign in →
            </Link>
          </div>
        </section>

        {/* Features grid */}
        <section className="py-20 px-6 max-w-6xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-center mb-12 text-surface-100">
            Everything you need to dominate social media
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Sparkles, title: 'AI Content Generation', desc: 'Generate posts, captions, threads, and carousels with Gemini AI in seconds', color: 'from-brand-500 to-brand-600' },
              { icon: Zap, title: 'Real-time Streaming', desc: 'Watch your content generate word by word with live AI streaming responses', color: 'from-accent-500 to-accent-600' },
              { icon: Calendar, title: 'Content Scheduling', desc: 'Plan and organize your content calendar with an intuitive scheduling UI', color: 'from-green-500 to-emerald-600' },
              { icon: BarChart2, title: 'Analytics Dashboard', desc: 'Track content performance and workspace statistics at a glance', color: 'from-orange-500 to-amber-600' },
              { icon: Download, title: 'Multi-format Export', desc: 'Export your content as PDF, Markdown, or JSON with one click', color: 'from-purple-500 to-violet-600' },
              { icon: Shield, title: 'Brand Workspaces', desc: 'Organize content by brand or project with dedicated workspaces', color: 'from-pink-500 to-rose-600' }
            ].map((f, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/8 transition-colors">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2 text-white">{f.title}</h3>
                <p className="text-surface-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6 text-center">
          <div className="max-w-2xl mx-auto p-12 rounded-3xl bg-gradient-to-br from-brand-500/20 to-accent-500/10 border border-brand-500/20">
            <h2 className="font-display text-4xl font-bold mb-4 text-white">Ready to 10x your content?</h2>
            <p className="text-surface-400 mb-8 text-lg">Join creators and businesses using SocialPilot to produce better content faster.</p>
            <Link to="/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-brand-500 hover:bg-brand-400 text-white rounded-xl font-semibold text-lg transition-all">
              <Sparkles className="w-5 h-5" />
              Get started free
            </Link>
          </div>
        </section>

        <footer className="text-center py-8 text-surface-500 text-sm border-t border-white/5">
          © {new Date().getFullYear()} SocialPilot · Built with Gemini AI
        </footer>
      </div>
    </div>
  );
}
