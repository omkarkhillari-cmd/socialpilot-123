import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { authRouter } from './routes/auth.js';
import { workspaceRouter } from './routes/workspace.js';
import { contentRouter } from './routes/content.js';
import { aiRouter } from './routes/ai.js';
import { exportRouter } from './routes/export.js';
import { scheduleRouter } from './routes/schedule.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: false
}));

// CORS - allow all origins (handles any misconfigured env vars)
app.use(cors({
  origin: function(origin, callback) {
    // Allow all origins
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.'
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: 'AI generation rate limit exceeded. Please wait a moment.'
});

app.use('/api/', limiter);
app.use('/api/ai/', aiLimiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/workspaces', workspaceRouter);
app.use('/api/content', contentRouter);
app.use('/api/ai', aiRouter);
app.use('/api/export', exportRouter);
app.use('/api/schedule', scheduleRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// Root
app.get('/', (req, res) => {
  res.json({ message: 'SocialPilot API', status: 'running' });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 SocialPilot API running on port ${PORT}`);
});

export default app;
