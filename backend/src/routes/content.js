import { Router } from 'express';
import { z } from 'zod';
import { db } from '../models/store.js';
import { authenticate } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';

export const contentRouter = Router();
contentRouter.use(authenticate);

// GET /api/content/workspace/:workspaceId
contentRouter.get('/workspace/:workspaceId', (req, res, next) => {
  const workspace = db.getWorkspaceById(req.params.workspaceId);
  if (!workspace) throw createError(404, 'Workspace not found');
  if (workspace.userId !== req.user.id) throw createError(403, 'Forbidden');
  
  const { platform, contentType, status, search } = req.query;
  let items = db.getContentByWorkspace(req.params.workspaceId);
  
  if (platform) items = items.filter(i => i.platform === platform);
  if (contentType) items = items.filter(i => i.contentType === contentType);
  if (status) items = items.filter(i => i.status === status);
  if (search) {
    const s = search.toLowerCase();
    items = items.filter(i => 
      i.topic?.toLowerCase().includes(s) || 
      i.generatedContent?.toLowerCase().includes(s)
    );
  }
  
  res.json({ items, total: items.length });
});

// GET /api/content/:id
contentRouter.get('/:id', (req, res, next) => {
  const item = db.getContentById(req.params.id);
  if (!item) throw createError(404, 'Content not found');
  const workspace = db.getWorkspaceById(item.workspaceId);
  if (workspace.userId !== req.user.id) throw createError(403, 'Forbidden');
  res.json({ item });
});

// PUT /api/content/:id
contentRouter.put('/:id', (req, res, next) => {
  try {
    const schema = z.object({
      generatedContent: z.string().optional(),
      status: z.enum(['draft', 'approved', 'published', 'archived']).optional(),
      notes: z.string().max(1000).optional(),
      tags: z.array(z.string()).optional()
    });
    
    const item = db.getContentById(req.params.id);
    if (!item) throw createError(404, 'Content not found');
    const workspace = db.getWorkspaceById(item.workspaceId);
    if (workspace.userId !== req.user.id) throw createError(403, 'Forbidden');
    
    const data = schema.parse(req.body);
    const updated = db.updateContent(req.params.id, data);
    res.json({ item: updated });
  } catch (err) { next(err); }
});

// DELETE /api/content/:id
contentRouter.delete('/:id', (req, res, next) => {
  const item = db.getContentById(req.params.id);
  if (!item) throw createError(404, 'Content not found');
  const workspace = db.getWorkspaceById(item.workspaceId);
  if (workspace.userId !== req.user.id) throw createError(403, 'Forbidden');
  db.deleteContent(req.params.id);
  res.json({ message: 'Content deleted' });
});

// POST /api/content/:id/approve
contentRouter.post('/:id/approve', (req, res, next) => {
  const item = db.getContentById(req.params.id);
  if (!item) throw createError(404, 'Content not found');
  const workspace = db.getWorkspaceById(item.workspaceId);
  if (workspace.userId !== req.user.id) throw createError(403, 'Forbidden');
  const updated = db.updateContent(req.params.id, { status: 'approved', approvedAt: new Date().toISOString() });
  res.json({ item: updated });
});
