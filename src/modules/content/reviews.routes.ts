import { Router } from 'express';
import { prisma } from '../../shared/prisma';

const router = Router();

// GET /api/content/reviews/music
router.get('/music', async (req, res) => {
  try {
    const posts = await prisma.musicReview.findMany({
      where: { deleted_at: null },
      orderBy: { created_at: 'desc' },
      include: { artist: true },
    });
    res.json({ data: posts });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch music reviews' });
  }
});

// GET /api/content/reviews/radar
router.get('/radar', async (req, res) => {
  try {
    const posts = await prisma.releaseRadar.findMany({
      where: { deleted_at: null },
      orderBy: { created_at: 'desc' },
      include: { artist: true },
    });
    res.json({ data: posts });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch release radar' });
  }
});

export default router;
