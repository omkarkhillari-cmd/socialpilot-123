import { Router } from 'express';
import { z } from 'zod';
import { db } from '../models/store.js';
import { authenticate } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';

export const exportRouter = Router();
exportRouter.use(authenticate);

// Export to Markdown
const toMarkdown = (workspace, items) => {
  let md = `# ${workspace.name} - Content Export\n\n`;
  md += `**Industry:** ${workspace.industry || 'N/A'}\n`;
  md += `**Exported:** ${new Date().toLocaleString()}\n\n---\n\n`;
  
  const grouped = {};
  items.forEach(item => {
    if (!grouped[item.platform]) grouped[item.platform] = [];
    grouped[item.platform].push(item);
  });

  for (const [platform, platformItems] of Object.entries(grouped)) {
    md += `## ${platform.charAt(0).toUpperCase() + platform.slice(1)}\n\n`;
    platformItems.forEach((item, idx) => {
      md += `### ${idx + 1}. ${item.contentType?.toUpperCase() || 'POST'}\n`;
      md += `**Topic:** ${item.topic}\n`;
      md += `**Tone:** ${item.tone}\n`;
      md += `**Status:** ${item.status}\n`;
      md += `**Created:** ${new Date(item.createdAt).toLocaleString()}\n\n`;
      md += `${item.generatedContent}\n\n---\n\n`;
    });
  }
  return md;
};

// Export to JSON
const toJSON = (workspace, items, schedules) => ({
  exportVersion: '1.0',
  exportedAt: new Date().toISOString(),
  workspace: {
    id: workspace.id,
    name: workspace.name,
    industry: workspace.industry,
    targetAudience: workspace.targetAudience
  },
  totalItems: items.length,
  content: items.map(item => ({
    id: item.id,
    platform: item.platform,
    contentType: item.contentType,
    tone: item.tone,
    topic: item.topic,
    content: item.generatedContent,
    status: item.status,
    createdAt: item.createdAt
  })),
  scheduledPosts: schedules
});

// GET /api/export/workspace/:workspaceId/markdown
exportRouter.get('/workspace/:workspaceId/markdown', (req, res, next) => {
  const workspace = db.getWorkspaceById(req.params.workspaceId);
  if (!workspace) throw createError(404, 'Workspace not found');
  if (workspace.userId !== req.user.id) throw createError(403, 'Forbidden');
  
  const items = db.getContentByWorkspace(req.params.workspaceId);
  const markdown = toMarkdown(workspace, items);
  
  res.setHeader('Content-Type', 'text/markdown');
  res.setHeader('Content-Disposition', `attachment; filename="${workspace.name}-content.md"`);
  res.send(markdown);
});

// GET /api/export/workspace/:workspaceId/json
exportRouter.get('/workspace/:workspaceId/json', (req, res, next) => {
  const workspace = db.getWorkspaceById(req.params.workspaceId);
  if (!workspace) throw createError(404, 'Workspace not found');
  if (workspace.userId !== req.user.id) throw createError(403, 'Forbidden');
  
  const items = db.getContentByWorkspace(req.params.workspaceId);
  const schedules = db.getScheduledPostsByWorkspace(req.params.workspaceId);
  const data = toJSON(workspace, items, schedules);
  
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="${workspace.name}-export.json"`);
  res.json(data);
});

// POST /api/export/content/:id/pdf-data - Returns data for client-side PDF gen
exportRouter.get('/content/:id/pdf-data', (req, res, next) => {
  const item = db.getContentById(req.params.id);
  if (!item) throw createError(404, 'Content not found');
  const workspace = db.getWorkspaceById(item.workspaceId);
  if (workspace.userId !== req.user.id) throw createError(403, 'Forbidden');
  res.json({ item, workspace });
});
