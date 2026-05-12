import { Router } from 'express';
import { z } from 'zod';
import { db } from '../models/store.js';
import { authenticate } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';

export const scheduleRouter = Router();
scheduleRouter.use(authenticate);

const scheduleSchema = z.object({
  workspaceId: z.string().uuid(),
  contentId: z.string().uuid().optional(),
  platform: z.string(),
  content: z.string().min(1),
  scheduledAt: z.string().datetime(),
  title: z.string().optional(),
  imageUrl: z.string().optional()
});

// GET /api/schedule/workspace/:workspaceId
scheduleRouter.get('/workspace/:workspaceId', (req, res, next) => {
  const workspace = db.getWorkspaceById(req.params.workspaceId);
  if (!workspace) throw createError(404, 'Workspace not found');
  if (workspace.userId !== req.user.id) throw createError(403, 'Forbidden');
  const posts = db.getScheduledPostsByWorkspace(req.params.workspaceId);
  res.json({ posts });
});

// POST /api/schedule
scheduleRouter.post('/', (req, res, next) => {
  try {
    const data = scheduleSchema.parse(req.body);
    const workspace = db.getWorkspaceById(data.workspaceId);
    if (!workspace) throw createError(404, 'Workspace not found');
    if (workspace.userId !== req.user.id) throw createError(403, 'Forbidden');
    const post = db.createScheduledPost({ ...data, userId: req.user.id });
    res.status(201).json({ post });
  } catch (err) { next(err); }
});

// PUT /api/schedule/:id
scheduleRouter.put('/:id', (req, res, next) => {
  try {
    const schema = z.object({
      scheduledAt: z.string().datetime().optional(),
      status: z.enum(['scheduled', 'published', 'cancelled']).optional(),
      content: z.string().optional()
    });
    const data = schema.parse(req.body);
    const updated = db.updateScheduledPost(req.params.id, data);
    if (!updated) throw createError(404, 'Scheduled post not found');
    res.json({ post: updated });
  } catch (err) { next(err); }
});

// DELETE /api/schedule/:id
scheduleRouter.delete('/:id', (req, res, next) => {
  db.deleteScheduledPost(req.params.id);
  res.json({ message: 'Scheduled post deleted' });
});
