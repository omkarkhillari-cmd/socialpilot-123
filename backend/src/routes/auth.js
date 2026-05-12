import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '../models/store.js';
import { generateToken, authenticate } from '../middleware/auth.js';
import { createError } from '../middleware/errorHandler.js';

export const authRouter = Router();

const signupSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(100)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

// POST /api/auth/signup
authRouter.post('/signup', async (req, res, next) => {
  try {
    const data = signupSchema.parse(req.body);
    
    if (db.findUserByEmail(data.email)) {
      throw createError(409, 'Email already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user = db.createUser({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name)}`
    });

    const token = generateToken(user.id);
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({ user: userWithoutPassword, token });
  } catch (err) { next(err); }
});

// POST /api/auth/login
authRouter.post('/login', async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = db.findUserByEmail(data.email);

    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw createError(401, 'Invalid email or password');
    }

    const token = generateToken(user.id);
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (err) { next(err); }
});

// GET /api/auth/me
authRouter.get('/me', authenticate, (req, res) => {
  const { password: _, ...user } = req.user;
  res.json({ user });
});

// PUT /api/auth/profile
authRouter.put('/profile', authenticate, async (req, res, next) => {
  try {
    const schema = z.object({ name: z.string().min(2).max(50).optional() });
    const data = schema.parse(req.body);
    const updated = db.updateUser(req.user.id, data);
    const { password: _, ...user } = updated;
    res.json({ user });
  } catch (err) { next(err); }
});
