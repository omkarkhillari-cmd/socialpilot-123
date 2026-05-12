import { Router } from 'express';
import { z } from 'zod';
import { db } from '../models/store.js';
import { authenticate } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';

export const workspaceRouter = Router();
workspaceRouter.use(authenticate);

const workspaceSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  industry: z.string().max(100).optional(),
  brandVoice: z.string().max(1000).optional(),
  targetAudience: z.string().max(500).optional(),
  website: z.string().url().optional().or(z.literal('')),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional()
});

// GET /api/workspaces
workspaceRouter.get('/', (req, res) => {
  const workspaces = db.getWorkspacesByUser(req.user.id);
  res.json({ workspaces });
});

// POST /api/workspaces
workspaceRouter.post('/', (req, res, next) => {
  try {
    const data = workspaceSchema.parse(req.body);
    const workspace = db.createWorkspace({ ...data, userId: req.user.id });
    res.status(201).json({ workspace });
  } catch (err) { next(err); }
});

// GET /api/workspaces/:id
workspaceRouter.get('/:id', (req, res, next) => {
  const workspace = db.getWorkspaceById(req.params.id);
  if (!workspace) throw createError(404, 'Workspace not found');
  if (workspace.userId !== req.user.id) throw createError(403, 'Forbidden');
  res.json({ workspace });
});

// PUT /api/workspaces/:id
workspaceRouter.put('/:id', (req, res, next) => {
  try {
    const workspace = db.getWorkspaceById(req.params.id);
    if (!workspace) throw createError(404, 'Workspace not found');
    if (workspace.userId !== req.user.id) throw createError(403, 'Forbidden');
    const data = workspaceSchema.partial().parse(req.body);
    const updated = db.updateWorkspace(req.params.id, data);
    res.json({ workspace: updated });
  } catch (err) { next(err); }
});

// DELETE /api/workspaces/:id
workspaceRouter.delete('/:id', (req, res, next) => {
  const workspace = db.getWorkspaceById(req.params.id);
  if (!workspace) throw createError(404, 'Workspace not found');
  if (workspace.userId !== req.user.id) throw createError(403, 'Forbidden');
  db.deleteWorkspace(req.params.id);
  res.json({ message: 'Workspace deleted' });
});
