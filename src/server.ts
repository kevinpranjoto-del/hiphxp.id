import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import path from 'path';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { prisma } from './shared/prisma';
import authRoutes from './modules/auth/routes';
import contentRoutes from './modules/content/routes';
import eventRoutes from './modules/events/routes';
import partnershipRoutes from './modules/partnership/routes';
import dashboardRoutes from './modules/dashboard/routes';
import songsRoutes from './modules/songs/routes';
import usersRoutes from './modules/users/routes';
import artistsRoutes from './modules/artists/routes';
import collectivesRoutes from './modules/collectives/routes';
import lifestyleRoutes from './modules/content/lifestyle.routes';
import editorialRoutes from './modules/content/editorial.routes';
import reviewsRoutes from './modules/content/reviews.routes';

const app = express();

const uploadDir = path.join(process.cwd(), 'public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(path.join(uploadDir, 'audio'), { recursive: true });
  fs.mkdirSync(path.join(uploadDir, 'images'), { recursive: true });
}

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: env.rateLimitWindowMs, max: env.rateLimitMax }));
app.use('/public', express.static(path.join(process.cwd(), 'public')));
app.use(express.static(path.join(process.cwd(), 'frontend'))); // Serve static frontend files

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.get('/maintenance', (_req, res) => res.status(200).json({
  message: 'Maintenance / Coming Soon',
  status: 'maintenance',
  platform: 'HipHXP.id',
  backend: 'ready',
}));

app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/partnerships', partnershipRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/songs', songsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/artists', artistsRoutes);
app.use('/api/collectives', collectivesRoutes);
app.use('/api/content/lifestyle', lifestyleRoutes);
app.use('/api/content/editorials', editorialRoutes);
app.use('/api/content/reviews', reviewsRoutes);

app.get('/api/docs', (_req, res) => res.json({
  message: 'Backend API documentation',
  endpoints: [
    '/api/auth/register',
    '/api/auth/login',
    '/api/auth/verify-email',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/auth/refresh',
    '/api/auth/logout',
    '/api/content/articles',
    '/api/content/articles/:slug',
    '/api/songs',
    '/api/songs/:slug',
    '/api/users',
    '/api/users/:id',
    '/api/events',
    '/api/partnerships',
    '/api/partnerships/:id',
    '/api/artists',
    '/api/artists/:slug',
    '/api/dashboard/stats',
    '/maintenance',
  ],
}));

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

const startServer = async () => {
  try {
    await prisma.$connect();
    app.listen(env.port, () => {
      console.log(`Server running on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();
