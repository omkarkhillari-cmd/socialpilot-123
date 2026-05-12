export const PLATFORMS = {
  instagram: {
    key: 'instagram',
    label: 'Instagram',
    icon: '📸',
    color: '#E1306C',
    gradient: 'from-purple-500 via-pink-500 to-orange-400',
    bgClass: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400',
    maxLength: 2200,
    emoji: '📸'
  },
  linkedin: {
    key: 'linkedin',
    label: 'LinkedIn',
    icon: '💼',
    color: '#0077B5',
    gradient: 'from-blue-600 to-blue-700',
    bgClass: 'bg-blue-600',
    maxLength: 3000,
    emoji: '💼'
  },
  twitter: {
    key: 'twitter',
    label: 'Twitter/X',
    icon: '𝕏',
    color: '#000000',
    gradient: 'from-gray-800 to-black',
    bgClass: 'bg-black',
    maxLength: 280,
    emoji: '𝕏'
  },
  facebook: {
    key: 'facebook',
    label: 'Facebook',
    icon: '👥',
    color: '#1877F2',
    gradient: 'from-blue-500 to-blue-600',
    bgClass: 'bg-blue-500',
    maxLength: 63206,
    emoji: '👥'
  },
  tiktok: {
    key: 'tiktok',
    label: 'TikTok',
    icon: '🎵',
    color: '#010101',
    gradient: 'from-gray-900 to-black',
    bgClass: 'bg-gray-900',
    maxLength: 2200,
    emoji: '🎵'
  }
};

export const TONES = [
  { key: 'professional', label: 'Professional', emoji: '👔' },
  { key: 'casual', label: 'Casual', emoji: '😊' },
  { key: 'witty', label: 'Witty', emoji: '😄' },
  { key: 'inspirational', label: 'Inspirational', emoji: '✨' },
  { key: 'educational', label: 'Educational', emoji: '📚' },
  { key: 'excited', label: 'Excited', emoji: '🔥' },
  { key: 'empathetic', label: 'Empathetic', emoji: '💙' },
  { key: 'bold', label: 'Bold', emoji: '⚡' }
];

export const CONTENT_TYPES = [
  { key: 'post', label: 'Social Post', icon: '📝', description: 'Standard platform post' },
  { key: 'caption', label: 'Caption', icon: '💬', description: 'Image or video caption' },
  { key: 'carousel', label: 'Carousel', icon: '🎠', description: 'Multi-slide content' },
  { key: 'hashtags', label: 'Hashtags', icon: '#', description: 'Strategic hashtag sets' },
  { key: 'reel_script', label: 'Reel Script', icon: '🎬', description: 'Short video script' },
  { key: 'campaign', label: 'Campaign', icon: '🎯', description: 'Full campaign concept' }
];

export const INDUSTRIES = [
  'Technology', 'E-commerce', 'Fashion', 'Food & Beverage', 'Healthcare',
  'Finance', 'Education', 'Travel', 'Fitness & Wellness', 'Beauty & Cosmetics',
  'Real Estate', 'Marketing Agency', 'SaaS', 'Entertainment', 'Non-profit',
  'Automotive', 'Architecture', 'Photography', 'Consulting', 'Other'
];

export const WORKSPACE_COLORS = [
  '#0ea5e9', '#d946ef', '#f97316', '#10b981', '#8b5cf6',
  '#f43f5e', '#06b6d4', '#84cc16', '#eab308', '#6366f1'
];

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(new Date(date));
};

export const formatRelative = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
};

export const truncate = (text, length = 100) => {
  if (!text || text.length <= length) return text;
  return text.slice(0, length) + '...';
};

export const downloadFile = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const generatePDF = async (item, workspace) => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  
  const platform = PLATFORMS[item.platform] || { label: item.platform };
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFillColor(14, 165, 233);
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('SocialPilot', 20, 20);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`${workspace.name} — ${platform.label} Content`, 20, 32);
  
  // Meta
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text(`Generated: ${formatDate(item.createdAt)}`, 20, 55);
  doc.text(`Topic: ${item.topic}`, 20, 63);
  doc.text(`Tone: ${item.tone || '—'}  |  Type: ${item.contentType || 'post'}  |  Status: ${item.status}`, 20, 71);

  // Content
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Generated Content', 20, 85);
  doc.setDrawColor(14, 165, 233);
  doc.line(20, 88, pageWidth - 20, 88);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 30, 30);
  const lines = doc.splitTextToSize(item.generatedContent || '', pageWidth - 40);
  doc.text(lines, 20, 96);
  
  // Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Generated by SocialPilot AI Content Studio', 20, pageHeight - 15);
  
  doc.save(`${workspace.name}-${item.contentType || 'post'}-${item.id.slice(0, 8)}.pdf`);
};
