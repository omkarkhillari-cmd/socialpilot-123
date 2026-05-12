// In-memory database - replace with PostgreSQL/MongoDB in production
// This simulates a proper DB layer with the same interface

import { v4 as uuidv4 } from 'uuid';

class InMemoryStore {
  constructor() {
    this.users = new Map();
    this.workspaces = new Map();
    this.contentItems = new Map();
    this.scheduledPosts = new Map();
    this.promptTemplates = new Map();
    
    // Seed prompt templates
    this._seedTemplates();
  }

  _seedTemplates() {
    const templates = [
      {
        id: uuidv4(),
        name: 'Product Launch',
        platform: 'instagram',
        tone: 'excited',
        promptPrefix: 'Create an engaging product launch announcement for Instagram.',
        category: 'marketing'
      },
      {
        id: uuidv4(),
        name: 'Thought Leadership',
        platform: 'linkedin',
        tone: 'professional',
        promptPrefix: 'Write an insightful thought leadership post for LinkedIn professionals.',
        category: 'branding'
      },
      {
        id: uuidv4(),
        name: 'Viral Thread',
        platform: 'twitter',
        tone: 'witty',
        promptPrefix: 'Create a viral Twitter/X thread with hook, insights, and CTA.',
        category: 'engagement'
      },
      {
        id: uuidv4(),
        name: 'Behind the Scenes',
        platform: 'instagram',
        tone: 'casual',
        promptPrefix: 'Write an authentic behind-the-scenes Instagram caption.',
        category: 'storytelling'
      },
      {
        id: uuidv4(),
        name: 'Campaign Idea',
        platform: 'all',
        tone: 'creative',
        promptPrefix: 'Generate a creative multi-platform campaign concept.',
        category: 'campaign'
      }
    ];
    templates.forEach(t => this.promptTemplates.set(t.id, t));
  }

  // Users
  createUser(data) {
    const user = { id: uuidv4(), createdAt: new Date().toISOString(), ...data };
    this.users.set(user.id, user);
    return user;
  }
  findUserByEmail(email) {
    return [...this.users.values()].find(u => u.email === email);
  }
  findUserById(id) { return this.users.get(id); }
  updateUser(id, data) {
    const user = this.users.get(id);
    if (!user) return null;
    const updated = { ...user, ...data, updatedAt: new Date().toISOString() };
    this.users.set(id, updated);
    return updated;
  }

  // Workspaces
  createWorkspace(data) {
    const ws = { id: uuidv4(), createdAt: new Date().toISOString(), contentCount: 0, ...data };
    this.workspaces.set(ws.id, ws);
    return ws;
  }
  getWorkspacesByUser(userId) {
    return [...this.workspaces.values()].filter(w => w.userId === userId);
  }
  getWorkspaceById(id) { return this.workspaces.get(id); }
  updateWorkspace(id, data) {
    const ws = this.workspaces.get(id);
    if (!ws) return null;
    const updated = { ...ws, ...data, updatedAt: new Date().toISOString() };
    this.workspaces.set(id, updated);
    return updated;
  }
  deleteWorkspace(id) { return this.workspaces.delete(id); }

  // Content
  createContent(data) {
    const item = { id: uuidv4(), createdAt: new Date().toISOString(), ...data };
    this.contentItems.set(item.id, item);
    // Update workspace content count
    const ws = this.workspaces.get(data.workspaceId);
    if (ws) this.workspaces.set(ws.id, { ...ws, contentCount: (ws.contentCount || 0) + 1 });
    return item;
  }
  getContentByWorkspace(workspaceId) {
    return [...this.contentItems.values()]
      .filter(c => c.workspaceId === workspaceId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  getContentById(id) { return this.contentItems.get(id); }
  updateContent(id, data) {
    const item = this.contentItems.get(id);
    if (!item) return null;
    const updated = { ...item, ...data, updatedAt: new Date().toISOString() };
    this.contentItems.set(id, updated);
    return updated;
  }
  deleteContent(id) {
    const item = this.contentItems.get(id);
    if (item) {
      const ws = this.workspaces.get(item.workspaceId);
      if (ws) this.workspaces.set(ws.id, { ...ws, contentCount: Math.max(0, (ws.contentCount || 1) - 1) });
    }
    return this.contentItems.delete(id);
  }

  // Scheduled Posts
  createScheduledPost(data) {
    const post = { id: uuidv4(), createdAt: new Date().toISOString(), status: 'scheduled', ...data };
    this.scheduledPosts.set(post.id, post);
    return post;
  }
  getScheduledPostsByWorkspace(workspaceId) {
    return [...this.scheduledPosts.values()]
      .filter(p => p.workspaceId === workspaceId)
      .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
  }
  updateScheduledPost(id, data) {
    const post = this.scheduledPosts.get(id);
    if (!post) return null;
    const updated = { ...post, ...data, updatedAt: new Date().toISOString() };
    this.scheduledPosts.set(id, updated);
    return updated;
  }
  deleteScheduledPost(id) { return this.scheduledPosts.delete(id); }

  // Templates
  getAllTemplates() { return [...this.promptTemplates.values()]; }
  getTemplateById(id) { return this.promptTemplates.get(id); }
}

export const db = new InMemoryStore();
