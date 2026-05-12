import { GoogleGenerativeAI } from '@google/generative-ai';

const getClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');
  return new GoogleGenerativeAI(apiKey);
};

// Platform-specific prompt configurations
export const PLATFORM_CONFIGS = {
  instagram: {
    name: 'Instagram',
    maxLength: 2200,
    characteristics: 'visually-driven, authentic, emoji-friendly, story-telling, hashtag-heavy',
    format: 'engaging caption with emojis, line breaks for readability, 5-10 relevant hashtags'
  },
  linkedin: {
    name: 'LinkedIn',
    maxLength: 3000,
    characteristics: 'professional, thought-provoking, value-driven, networking-focused',
    format: 'professional post with hook, insights, key takeaways, soft CTA. Use line breaks. No hashtag spam.'
  },
  twitter: {
    name: 'Twitter/X',
    maxLength: 280,
    characteristics: 'punchy, witty, conversational, trend-aware',
    format: 'thread of 5-8 tweets, each under 280 chars. Number them (1/, 2/, etc.). Strong hook in first tweet.'
  },
  facebook: {
    name: 'Facebook',
    maxLength: 63206,
    characteristics: 'community-focused, conversational, shareable, mix of personal and promotional',
    format: 'engaging post that encourages shares and comments. Can be longer form. Include a question or CTA.'
  },
  tiktok: {
    name: 'TikTok',
    maxLength: 2200,
    characteristics: 'trendy, energetic, Gen-Z friendly, hook-driven, challenge-oriented',
    format: 'short punchy caption, trending hashtags, viral hook. Script-style for video content.'
  }
};

export const TONE_CONFIGS = {
  professional: 'authoritative, polished, business-appropriate, data-driven',
  casual: 'conversational, friendly, approachable, everyday language',
  witty: 'clever, humorous, playful wordplay, light-hearted',
  inspirational: 'motivating, uplifting, emotionally resonant, call-to-action focused',
  educational: 'informative, clear, structured, value-packed',
  excited: 'enthusiastic, high-energy, exclamation points, dynamic',
  empathetic: 'warm, understanding, human-centered, emotionally aware',
  bold: 'direct, confident, provocative, attention-grabbing'
};

// Build structured prompt
export const buildContentPrompt = ({ brandName, industry, brandVoice, targetAudience, platform, tone, topic, additionalContext, contentType }) => {
  const platformConfig = PLATFORM_CONFIGS[platform] || PLATFORM_CONFIGS.instagram;
  const toneDescription = TONE_CONFIGS[tone] || tone;

  return `You are an expert social media strategist and copywriter for ${platformConfig.name}.

BRAND CONTEXT:
- Brand Name: ${brandName}
- Industry: ${industry || 'General Business'}
- Brand Voice: ${brandVoice || 'Professional and engaging'}
- Target Audience: ${targetAudience || 'General audience'}

PLATFORM: ${platformConfig.name}
- Characteristics: ${platformConfig.characteristics}
- Format Required: ${platformConfig.format}
- Max Length: ${platformConfig.maxLength} characters

TONE: ${toneDescription}
CONTENT TYPE: ${contentType || 'general post'}
TOPIC/BRIEF: ${topic}
${additionalContext ? `ADDITIONAL CONTEXT: ${additionalContext}` : ''}

TASK: Generate ${contentType === 'carousel' ? 'carousel slide text (5-7 slides with title and body)' : contentType === 'hashtags' ? '25-30 strategic hashtags in 3 tiers (branded, niche, broad)' : contentType === 'campaign' ? 'a complete campaign concept with name, theme, 5 post ideas, and KPIs' : contentType === 'reel_script' ? 'a 30-60 second reel script with hook, content, and CTA' : `a ${platformConfig.name} post`}.

Return ONLY the content, no meta-commentary or explanations. Make it ready to publish.`;
};

// Generate text content
export const generateTextContent = async (params) => {
  const client = getClient();
  const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  const prompt = buildContentPrompt(params);
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
};

// Stream text content
export const streamTextContent = async (params, onChunk) => {
  const client = getClient();
  const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  const prompt = buildContentPrompt(params);
  const result = await model.generateContentStream(prompt);
  
  let fullText = '';
  for await (const chunk of result.stream) {
    const text = chunk.text();
    fullText += text;
    onChunk(text);
  }
  return fullText;
};

// Generate hashtags
export const generateHashtags = async ({ brandName, industry, topic, platform }) => {
  const client = getClient();
  const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  const prompt = `Generate 30 strategic hashtags for ${platform} for a ${industry} brand called "${brandName}" posting about: "${topic}".

Organize them into 3 tiers:
TIER 1 - BRANDED (3-5): Brand-specific tags
TIER 2 - NICHE (10-15): Industry and topic-specific tags  
TIER 3 - BROAD (10-15): High-volume popular tags

Format: Return as JSON with structure: { "branded": [], "niche": [], "broad": [], "recommended": [] }
The "recommended" array should contain the best 10-15 mix from all tiers.
Return ONLY valid JSON, no markdown.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  try {
    return JSON.parse(text.replace(/```json\n?|\n?```/g, ''));
  } catch {
    return { branded: [], niche: [], broad: [], recommended: text.split('\n').filter(t => t.startsWith('#')) };
  }
};

// Generate image using Gemini
export const generateImage = async ({ prompt, style, platform }) => {
  const client = getClient();
  
  try {
    const model = client.getGenerativeModel({ model: 'gemini-2.0-flash-preview-image-generation' });
    
    const imagePrompt = `Create a professional social media image for ${platform}.
Style: ${style || 'modern, clean, professional'}
Description: ${prompt}
Make it visually striking, brand-appropriate, and optimized for ${platform}.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: imagePrompt }] }],
      generationConfig: { responseModalities: ['IMAGE', 'TEXT'] }
    });

    const response = result.response;
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return {
          success: true,
          imageData: part.inlineData.data,
          mimeType: part.inlineData.mimeType,
          isBase64: true
        };
      }
    }
    throw new Error('No image data in response');
  } catch (error) {
    // Fallback: return a placeholder with generation details
    console.error('Image generation error:', error.message);
    return {
      success: false,
      error: error.message,
      fallback: true,
      prompt: prompt,
      style: style
    };
  }
};

// Generate campaign concept
export const generateCampaign = async ({ brandName, industry, brandVoice, targetAudience, objective, duration, budget }) => {
  const client = getClient();
  const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  const prompt = `Create a comprehensive social media campaign for:
Brand: ${brandName}
Industry: ${industry}
Objective: ${objective}
Duration: ${duration || '4 weeks'}
Target Audience: ${targetAudience}

Generate a complete campaign strategy as JSON:
{
  "campaignName": "",
  "tagline": "",
  "theme": "",
  "objective": "",
  "platforms": [],
  "contentPillars": [],
  "weeklyPlan": [{ "week": 1, "theme": "", "posts": [] }],
  "hashtags": [],
  "kpis": [],
  "estimatedReach": "",
  "campaignIdeas": [{ "type": "", "description": "", "platform": "" }]
}

Return ONLY valid JSON.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  try {
    return JSON.parse(text.replace(/```json\n?|\n?```/g, ''));
  } catch {
    return { campaignName: 'Campaign', theme: text };
  }
};
