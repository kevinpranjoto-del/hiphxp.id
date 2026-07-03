import { Router } from 'express';
import { prisma } from '../../shared/prisma';

const router = Router();

router.get('/stats', async (_req, res) => {
  try {
    const [articles, artists, songs, events, partnerships, inquiries, views, users] = await Promise.all([
      prisma.article.count({ where: { deleted_at: null } }),
      prisma.artist.count({ where: { deleted_at: null } }),
      prisma.song.count({ where: { deleted_at: null } }),
      prisma.event.count({ where: { deleted_at: null } }),
      prisma.partnership.count({ where: { deleted_at: null } }),
      prisma.partnership.count({ where: { deleted_at: null } }),
      prisma.article.aggregate({ where: { deleted_at: null }, _sum: { view_count: true } }),
      prisma.user.count({ where: { deleted_at: null } }),
    ]);

    res.json({
      articles,
      artists,
      music: songs,
      events,
      partnerships,
      inquiries,
      views: views._sum.view_count || 0,
      users,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
});

export default router;
