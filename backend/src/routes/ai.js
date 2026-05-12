import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';
import { db } from '../models/store.js';
import {
  generateTextContent,
  streamTextContent,
  generateHashtags,
  generateImage,
  generateCampaign,
  PLATFORM_CONFIGS,
  TONE_CONFIGS
} from '../services/gemini.js';

export const aiRouter = Router();
aiRouter.use(authenticate);

const generateSchema = z.object({
  workspaceId: z.string().uuid(),
  platform: z.enum(['instagram', 'linkedin', 'twitter', 'facebook', 'tiktok']),
  tone: z.enum(['professional', 'casual', 'witty', 'inspirational', 'educational', 'excited', 'empathetic', 'bold']),
  topic: z.string().min(3).max(1000),
  contentType: z.enum(['post', 'carousel', 'hashtags', 'campaign', 'reel_script', 'caption']).default('post'),
  additionalContext: z.string().max(500).optional(),
  saveToHistory: z.boolean().default(true)
});

// GET /api/ai/config - Get platform and tone configs
aiRouter.get('/config', (req, res) => {
  res.json({
    platforms: Object.entries(PLATFORM_CONFIGS).map(([key, val]) => ({ key, ...val })),
    tones: Object.entries(TONE_CONFIGS).map(([key, description]) => ({ key, description })),
    contentTypes: [
      { key: 'post', label: 'Social Post' },
      { key: 'caption', label: 'Caption' },
      { key: 'carousel', label: 'Carousel Slides' },
      { key: 'hashtags', label: 'Hashtags' },
      { key: 'reel_script', label: 'Reel/Video Script' },
      { key: 'campaign', label: 'Campaign Concept' }
    ],
    templates: db.getAllTemplates()
  });
});

// POST /api/ai/generate - Generate content
aiRouter.post('/generate', async (req, res, next) => {
  try {
    const data = generateSchema.parse(req.body);
    
    const workspace = db.getWorkspaceById(data.workspaceId);
    if (!workspace) throw createError(404, 'Workspace not found');
    if (workspace.userId !== req.user.id) throw createError(403, 'Forbidden');

    const generationParams = {
      brandName: workspace.name,
      industry: workspace.industry,
      brandVoice: workspace.brandVoice,
      targetAudience: workspace.targetAudience,
      ...data
    };

    let result;
    if (data.contentType === 'hashtags') {
      result = await generateHashtags(generationParams);
    } else if (data.contentType === 'campaign') {
      result = await generateCampaign({ ...generationParams, objective: data.topic });
    } else {
      result = await generateTextContent(generationParams);
    }

    const content = data.saveToHistory ? db.createContent({
      workspaceId: data.workspaceId,
      userId: req.user.id,
      platform: data.platform,
      tone: data.tone,
      contentType: data.contentType,
      topic: data.topic,
      generatedContent: typeof result === 'string' ? result : JSON.stringify(result),
      rawResult: result,
      status: 'draft',
      prompt: data.topic,
      additionalContext: data.additionalContext
    }) : null;

    res.json({ content: result, saved: content });
  } catch (err) { next(err); }
});

// POST /api/ai/generate/stream - Stream content generation
aiRouter.post('/generate/stream', async (req, res, next) => {
  try {
    const data = generateSchema.parse(req.body);
    
    const workspace = db.getWorkspaceById(data.workspaceId);
    if (!workspace) throw createError(404, 'Workspace not found');
    if (workspace.userId !== req.user.id) throw createError(403, 'Forbidden');

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const generationParams = {
      brandName: workspace.name,
      industry: workspace.industry,
      brandVoice: workspace.brandVoice,
      targetAudience: workspace.targetAudience,
      ...data
    };

    const fullText = await streamTextContent(generationParams, (chunk) => {
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    });

    // Save to history
    const saved = data.saveToHistory ? db.createContent({
      workspaceId: data.workspaceId,
      userId: req.user.id,
      platform: data.platform,
      tone: data.tone,
      contentType: data.contentType,
      topic: data.topic,
      generatedContent: fullText,
      status: 'draft',
      prompt: data.topic
    }) : null;

    res.write(`data: ${JSON.stringify({ done: true, saved })}\n\n`);
    res.end();
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

// POST /api/ai/generate/image - Generate image
aiRouter.post('/generate/image', async (req, res, next) => {
  try {
    const schema = z.object({
      workspaceId: z.string().uuid(),
      prompt: z.string().min(5).max(1000),
      style: z.string().optional(),
      platform: z.string().optional(),
      saveToHistory: z.boolean().default(true)
    });
    
    const data = schema.parse(req.body);
    const workspace = db.getWorkspaceById(data.workspaceId);
    if (!workspace) throw createError(404, 'Workspace not found');
    if (workspace.userId !== req.user.id) throw createError(403, 'Forbidden');

    const result = await generateImage({
      prompt: data.prompt,
      style: data.style,
      platform: data.platform || 'instagram'
    });

    if (data.saveToHistory && result.success) {
      db.createContent({
        workspaceId: data.workspaceId,
        userId: req.user.id,
        platform: data.platform || 'instagram',
        contentType: 'image',
        topic: data.prompt,
        generatedContent: 'Image generated',
        imageData: result.imageData,
        mimeType: result.mimeType,
        status: 'draft'
      });
    }

    res.json(result);
  } catch (err) { next(err); }
});

// POST /api/ai/regenerate/:contentId
aiRouter.post('/regenerate/:contentId', async (req, res, next) => {
  try {
    const content = db.getContentById(req.params.contentId);
    if (!content) throw createError(404, 'Content not found');
    
    const workspace = db.getWorkspaceById(content.workspaceId);
    if (workspace.userId !== req.user.id) throw createError(403, 'Forbidden');

    const generationParams = {
      brandName: workspace.name,
      industry: workspace.industry,
      brandVoice: workspace.brandVoice,
      targetAudience: workspace.targetAudience,
      platform: content.platform,
      tone: content.tone,
      topic: content.topic,
      contentType: content.contentType,
      additionalContext: req.body.additionalContext
    };

    const result = await generateTextContent(generationParams);
    const updated = db.updateContent(content.id, {
      generatedContent: result,
      regeneratedAt: new Date().toISOString()
    });

    res.json({ content: updated });
  } catch (err) { next(err); }
});
