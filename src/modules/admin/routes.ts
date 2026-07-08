import { Router } from 'express';
import { prisma } from '../../shared/prisma';
import bcrypt from 'bcryptjs';
import { requireAuth } from '../../shared/authMiddleware';

const router = Router();

// Middleware to ensure admin role
const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== 'ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ message: 'Forbidden: Admins only' });
  }
  next();
};

router.use(requireAuth, requireAdmin);

router.get('/stats', async (_req, res) => {
  try {
    const [usersCount, songsCount, eventsCount, visitorRecord] = await Promise.all([
      prisma.user.count({ where: { deleted_at: null, account_type: 'MUSICIAN' } }),
      prisma.song.count({ where: { deleted_at: null } }),
      prisma.event.count({ where: { deleted_at: null } }),
      prisma.siteVisitor.findUnique({ where: { id: 1 } })
    ]);

    res.json({
      users: usersCount,
      songs: songsCount,
      events: eventsCount,
      visitors: visitorRecord?.visitors || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch admin stats' });
  }
});

// Admin Users CRUD (simplified)
router.get('/users', async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { deleted_at: null },
      include: { musician_profile: true },
      orderBy: { created_at: 'desc' }
    });
    res.json(users);
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    await prisma.user.update({
      where: { id: req.params.id },
      data: { deleted_at: new Date() }
    });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

router.put('/users/:id/password', async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const password_hash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.params.id },
      data: { password_hash }
    });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: 'Failed to update password' });
  }
});

// Admin Songs CRUD
router.get('/songs', async (_req, res) => {
  try {
    const songs = await prisma.song.findMany({
      where: { deleted_at: null },
      include: { artist: true },
      orderBy: { created_at: 'desc' }
    });
    res.json(songs);
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch songs' });
  }
});

router.delete('/songs/:id', async (req, res) => {
  try {
    await prisma.song.update({
      where: { id: req.params.id },
      data: { deleted_at: new Date() }
    });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: 'Failed to delete song' });
  }
});

// Admin Events CRUD
router.get('/events', async (_req, res) => {
  try {
    const events = await prisma.event.findMany({
      where: { deleted_at: null },
      orderBy: { created_at: 'desc' }
    });
    res.json(events);
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch events' });
  }
});

router.delete('/events/:id', async (req, res) => {
  try {
    await prisma.event.update({
      where: { id: req.params.id },
      data: { deleted_at: new Date() }
    });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: 'Failed to delete event' });
  }
});

export default router;
