import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  ArrowLeft, Sparkles, Zap, Image, Copy, Check, RefreshCw, 
  Save, ChevronDown, Info, Wand2, Hash
} from 'lucide-react';
import toast from 'react-hot-toast';
import { workspaceAPI, aiAPI } from '../../services/api.js';
import { PLATFORMS, TONES, CONTENT_TYPES } from '../../utils/constants.js';

const PlatformSelector = ({ value, onChange }) => (
  <div className="grid grid-cols-5 gap-2">
    {Object.values(PLATFORMS).map(p => (
      <button key={p.key} type="button" onClick={() => onChange(p.key)}
        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-xs font-medium ${
          value === p.key
            ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400'
            : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600 text-surface-500 dark:text-surface-400'
        }`}>
        <span className="text-xl">{p.emoji}</span>
        <span className="truncate w-full text-center">{p.label.split('/')[0]}</span>
      </button>
    ))}
  </div>
);

const ToneSelector = ({ value, onChange }) => (
  <div className="flex flex-wrap gap-2">
    {TONES.map(t => (
      <button key={t.key} type="button" onClick={() => onChange(t.key)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
          value === t.key
            ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400'
            : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 text-surface-500 dark:text-surface-400'
        }`}>
        <span>{t.emoji}</span>{t.label}
      </button>
    ))}
  </div>
);

const ContentTypeSelector = ({ value, onChange }) => (
  <div className="grid grid-cols-3 gap-2">
    {CONTENT_TYPES.map(t => (
      <button key={t.key} type="button" onClick={() => onChange(t.key)}
        className={`flex flex-col gap-1 p-3 rounded-xl border-2 text-left transition-all ${
          value === t.key
            ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
            : 'border-surface-200 dark:border-surface-700 hover:border-surface-300'
        }`}>
        <span className="text-base">{t.icon}</span>
        <span className={`text-xs font-semibold ${value === t.key ? 'text-brand-600 dark:text-brand-400' : 'text-surface-700 dark:text-surface-300'}`}>{t.label}</span>
        <span className="text-xs text-surface-400">{t.description}</span>
      </button>
    ))}
  </div>
);

function ContentOutput({ content, contentType, onRegenerate, onSave, isSaved }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    const text = typeof content === 'object' ? JSON.stringify(content, null, 2) : content;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard!');
  };

  const renderHashtags = (data) => {
    if (typeof data === 'string') {
      try { data = JSON.parse(data); } catch { return <p className="text-sm text-surface-700 dark:text-surface-300 whitespace-pre-wrap">{data}</p>; }
    }
    return (
      <div className="space-y-4">
        {['branded', 'niche', 'broad'].map(tier => data[tier]?.length > 0 && (
          <div key={tier}>
            <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">{tier}</h4>
            <div className="flex flex-wrap gap-1.5">
              {data[tier].map((tag, i) => (
                <span key={i} className="px-2.5 py-1 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-lg text-xs font-medium">{tag}</span>
              ))}
            </div>
          </div>
        ))}
        {data.recommended?.length > 0 && (
          <div className="border-t border-surface-200 dark:border-surface-700 pt-3">
            <h4 className="text-xs font-semibold text-green-500 uppercase tracking-wider mb-2">⭐ Recommended Mix</h4>
            <div className="flex flex-wrap gap-1.5">
              {data.recommended.map((tag, i) => (
                <span key={i} className="px-2.5 py-1 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg text-xs font-medium">{tag}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCampaign = (data) => {
    if (typeof data === 'string') {
      try { data = JSON.parse(data); } catch { return <p className="text-sm whitespace-pre-wrap">{data}</p>; }
    }
    return (
      <div className="space-y-4">
        <div className="p-4 bg-brand-50 dark:bg-brand-500/10 rounded-xl">
          <h3 className="font-display font-bold text-lg text-brand-700 dark:text-brand-400">{data.campaignName}</h3>
          <p className="text-sm text-brand-600 dark:text-brand-300 italic mt-1">"{data.tagline}"</p>
        </div>
        {data.theme && <div><span className="text-xs font-semibold text-surface-400 uppercase">Theme: </span><span className="text-sm text-surface-700 dark:text-surface-300">{data.theme}</span></div>}
        {data.contentPillars?.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">Content Pillars</h4>
            <div className="flex flex-wrap gap-1.5">{data.contentPillars.map((p, i) => <span key={i} className="badge bg-accent-100 dark:bg-accent-500/20 text-accent-700 dark:text-accent-400">{p}</span>)}</div>
          </div>
        )}
        {data.campaignIdeas?.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">Campaign Ideas</h4>
            <div className="space-y-2">{data.campaignIdeas.map((idea, i) => (
              <div key={i} className="p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
                <span className="badge bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-400 text-xs mr-2">{idea.platform}</span>
                <span className="text-xs font-medium text-surface-600 dark:text-surface-300">{idea.type}: </span>
                <span className="text-xs text-surface-500">{idea.description}</span>
              </div>
            ))}</div>
          </div>
        )}
        {data.kpis?.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">KPIs</h4>
            <div className="flex flex-wrap gap-1.5">{data.kpis.map((k, i) => <span key={i} className="badge bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400">{k}</span>)}</div>
          </div>
        )}
      </div>
    );
  };

  const displayContent = () => {
    if (contentType === 'hashtags') return renderHashtags(content);
    if (contentType === 'campaign') return renderCampaign(content);
    const text = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
    return <p className="text-sm text-surface-700 dark:text-surface-300 whitespace-pre-wrap leading-relaxed font-body">{text}</p>;
  };

  return (
    <div className="card overflow-hidden animate-slide-up">
      <div className="flex items-center justify-between px-5 py-3 border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Generated Content</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onRegenerate} className="btn-ghost py-1.5 px-3 text-xs">
            <RefreshCw className="w-3.5 h-3.5" /> Regenerate
          </button>
          <button onClick={handleCopy} className="btn-ghost py-1.5 px-3 text-xs">
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          {!isSaved && (
            <button onClick={onSave} className="btn-primary py-1.5 px-3 text-xs">
              <Save className="w-3.5 h-3.5" /> Save
            </button>
          )}
        </div>
      </div>
      <div className="p-5 max-h-[60vh] overflow-y-auto">
        {displayContent()}
      </div>
      {isSaved && (
        <div className="px-5 py-3 bg-green-50 dark:bg-green-900/20 border-t border-green-100 dark:border-green-900/30">
          <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" /> Saved to content history
          </p>
        </div>
      )}
    </div>
  );
}

export default function ContentGenerator() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    platform: 'instagram',
    tone: 'professional',
    contentType: 'post',
    topic: '',
    additionalContext: '',
    saveToHistory: true,
    useStreaming: true
  });
  
  const [output, setOutput] = useState(null);
  const [streamText, setStreamText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [tab, setTab] = useState('text'); // 'text' | 'image'
  const [imageForm, setImageForm] = useState({ prompt: '', style: 'modern, professional, clean' });
  const [imageResult, setImageResult] = useState(null);
  const streamCleanupRef = useRef(null);

  const { data: workspace } = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: () => workspaceAPI.get(workspaceId).then(r => r.data.workspace)
  });

  const { data: configData } = useQuery({
    queryKey: ['ai-config'],
    queryFn: () => aiAPI.getConfig().then(r => r.data)
  });

  const generateMutation = useMutation({
    mutationFn: (data) => aiAPI.generate(data),
    onSuccess: (res) => {
      setOutput(res.data.content);
      setIsSaved(!!res.data.saved);
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Generation failed')
  });

  const imageMutation = useMutation({
    mutationFn: (data) => aiAPI.generateImage(data),
    onSuccess: (res) => { setImageResult(res.data); },
    onError: (err) => toast.error(err.response?.data?.error || 'Image generation failed')
  });

  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!form.topic.trim()) { toast.error('Please enter a topic or brief'); return; }
    
    setOutput(null);
    setIsSaved(false);

    if (form.useStreaming && form.contentType !== 'hashtags' && form.contentType !== 'campaign') {
      setIsStreaming(true);
      setStreamText('');
      
      const cleanup = aiAPI.stream(
        { workspaceId, ...form },
        (chunk) => setStreamText(prev => prev + chunk),
        (saved) => { setIsStreaming(false); setOutput(streamText + ''); setIsSaved(!!saved); },
        (err) => { setIsStreaming(false); toast.error(err.message); }
      );
      streamCleanupRef.current = cleanup;
    } else {
      generateMutation.mutate({ workspaceId, ...form });
    }
  };

  const handleImageGenerate = (e) => {
    e?.preventDefault();
    if (!imageForm.prompt.trim()) { toast.error('Please describe the image'); return; }
    setImageResult(null);
    imageMutation.mutate({ workspaceId, ...imageForm, platform: form.platform });
  };

  useEffect(() => {
    return () => { if (streamCleanupRef.current) streamCleanupRef.current(); };
  }, []);

  const isLoading = generateMutation.isPending || isStreaming;
  const currentOutput = isStreaming ? streamText : output;

  const templates = configData?.templates || [];

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="btn-ghost p-2">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="font-display text-xl font-bold text-surface-900 dark:text-white">AI Content Studio</h1>
            {workspace && (
              <span className="badge bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400 text-xs">
                {workspace.name}
              </span>
            )}
          </div>
          <p className="text-sm text-surface-400">Generate AI-powered content for your brand</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/dashboard/workspaces/${workspaceId}/history`} className="btn-secondary text-sm py-2">
            <span>History</span>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-surface-100 dark:bg-surface-800 rounded-xl w-fit">
        {[
          { key: 'text', label: 'Text Content', icon: Sparkles },
          { key: 'image', label: 'Image Generation', icon: Image }
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === key ? 'bg-white dark:bg-surface-900 shadow-sm text-surface-900 dark:text-white' : 'text-surface-500 hover:text-surface-700'
            }`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Form */}
        <div className="space-y-5">
          {tab === 'text' ? (
            <form onSubmit={handleGenerate} className="space-y-5">
              {/* Templates */}
              {templates.length > 0 && (
                <div className="card p-4">
                  <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3">Quick Templates</p>
                  <div className="flex flex-wrap gap-2">
                    {templates.map(t => (
                      <button key={t.id} type="button"
                        onClick={() => setForm(p => ({ ...p, platform: t.platform === 'all' ? p.platform : t.platform, tone: t.tone, topic: t.promptPrefix }))}
                        className="px-3 py-1.5 bg-surface-100 dark:bg-surface-700 hover:bg-brand-50 dark:hover:bg-brand-500/10 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg text-xs font-medium text-surface-600 dark:text-surface-400 transition-all">
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Platform */}
              <div className="card p-4">
                <label className="label">Platform</label>
                <PlatformSelector value={form.platform} onChange={v => setForm(p => ({...p, platform: v}))} />
              </div>

              {/* Content Type */}
              <div className="card p-4">
                <label className="label">Content Type</label>
                <ContentTypeSelector value={form.contentType} onChange={v => setForm(p => ({...p, contentType: v}))} />
              </div>

              {/* Tone */}
              <div className="card p-4">
                <label className="label">Tone & Style</label>
                <ToneSelector value={form.tone} onChange={v => setForm(p => ({...p, tone: v}))} />
              </div>

              {/* Topic */}
              <div className="card p-4">
                <label className="label">Topic / Brief *</label>
                <textarea value={form.topic} onChange={e => setForm(p => ({...p, topic: e.target.value}))}
                  className="input resize-none" rows={3}
                  placeholder="What should this post be about? Describe your product launch, event, or message..." required />
                <div>
                  <label className="label mt-3">Additional Context</label>
                  <input value={form.additionalContext} onChange={e => setForm(p => ({...p, additionalContext: e.target.value}))}
                    className="input" placeholder="Key messages, URLs, offers, etc." />
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center justify-between p-4 card">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-brand-500" />
                  <span className="text-sm font-medium text-surface-700 dark:text-surface-300">Stream response live</span>
                </div>
                <button type="button" onClick={() => setForm(p => ({...p, useStreaming: !p.useStreaming}))}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.useStreaming ? 'bg-brand-500' : 'bg-surface-300 dark:bg-surface-600'}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.useStreaming ? 'translate-x-5' : ''}`} />
                </button>
              </div>

              <button type="submit" disabled={isLoading}
                className="w-full btn-primary justify-center py-3 text-base">
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {isStreaming ? 'Generating...' : 'Processing...'}
                  </>
                ) : (
                  <><Sparkles className="w-5 h-5" /> Generate Content</>
                )}
              </button>
            </form>
          ) : (
            /* Image generation form */
            <form onSubmit={handleImageGenerate} className="space-y-5">
              <div className="card p-4">
                <label className="label">Image Description *</label>
                <textarea value={imageForm.prompt} onChange={e => setImageForm(p => ({...p, prompt: e.target.value}))}
                  className="input resize-none" rows={4}
                  placeholder="A vibrant flat-lay of coffee products on a marble surface with warm morning light..." required />
              </div>
              <div className="card p-4">
                <label className="label">Visual Style</label>
                <div className="flex flex-wrap gap-2">
                  {['modern, professional, clean', 'vibrant, colorful, energetic', 'minimal, white, editorial', 'dark, moody, dramatic', 'warm, cozy, lifestyle'].map(s => (
                    <button key={s} type="button" onClick={() => setImageForm(p => ({...p, style: s}))}
                      className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${imageForm.style === s ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10 text-brand-600' : 'border-surface-200 dark:border-surface-700 text-surface-500'}`}>
                      {s.split(',')[0]}
                    </button>
                  ))}
                </div>
                <input value={imageForm.style} onChange={e => setImageForm(p => ({...p, style: e.target.value}))}
                  className="input mt-3" placeholder="Custom style description" />
              </div>
              <button type="submit" disabled={imageMutation.isPending}
                className="w-full btn-primary justify-center py-3 text-base">
                {imageMutation.isPending ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating Image...</>
                ) : (
                  <><Image className="w-5 h-5" /> Generate Image</>
                )}
              </button>
            </form>
          )}
        </div>

        {/* RIGHT: Output */}
        <div className="space-y-4">
          {tab === 'text' ? (
            currentOutput ? (
              <ContentOutput
                content={currentOutput}
                contentType={form.contentType}
                onRegenerate={handleGenerate}
                onSave={() => generateMutation.mutate({ workspaceId, ...form })}
                isSaved={isSaved}
              />
            ) : (
              <div className="card p-8 flex flex-col items-center justify-center min-h-[300px] text-center">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${isLoading ? 'bg-brand-500/10' : 'bg-surface-100 dark:bg-surface-800'}`}>
                  {isLoading ? (
                    <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
                  ) : (
                    <Wand2 className="w-8 h-8 text-surface-300 dark:text-surface-600" />
                  )}
                </div>
                <p className="text-surface-400 text-sm">
                  {isLoading ? 'AI is crafting your content...' : 'Fill in the form and click Generate'}
                </p>
              </div>
            )
          ) : (
            imageResult ? (
              <div className="card overflow-hidden animate-slide-up">
                <div className="flex items-center justify-between px-5 py-3 border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
                  <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Generated Image</span>
                </div>
                <div className="p-5">
                  {imageResult.success && imageResult.imageData ? (
                    <img src={`data:${imageResult.mimeType};base64,${imageResult.imageData}`}
                      alt="Generated" className="w-full rounded-xl" />
                  ) : (
                    <div className="p-6 bg-surface-50 dark:bg-surface-800 rounded-xl text-center">
                      <Image className="w-12 h-12 text-surface-300 mx-auto mb-3" />
                      <p className="text-sm font-medium text-surface-600 dark:text-surface-400 mb-1">Image Generation Note</p>
                      <p className="text-xs text-surface-400 mb-3">{imageResult.error || 'Generation requires Gemini image model access'}</p>
                      <div className="text-xs text-surface-400 bg-surface-100 dark:bg-surface-700 p-3 rounded-lg text-left">
                        <strong>Prompt used:</strong> {imageResult.prompt}<br />
                        <strong>Style:</strong> {imageResult.style}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="card p-8 flex flex-col items-center justify-center min-h-[300px] text-center">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${imageMutation.isPending ? 'bg-accent-500/10' : 'bg-surface-100 dark:bg-surface-800'}`}>
                  {imageMutation.isPending ? (
                    <div className="w-8 h-8 border-3 border-accent-200 border-t-accent-500 rounded-full animate-spin" />
                  ) : (
                    <Image className="w-8 h-8 text-surface-300 dark:text-surface-600" />
                  )}
                </div>
                <p className="text-surface-400 text-sm">
                  {imageMutation.isPending ? 'Generating your image with Gemini...' : 'Describe an image to generate it'}
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
