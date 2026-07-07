import { Router } from 'express';
import { prisma } from '../../shared/prisma';

const router = Router();

// GET /api/content/lifestyle/streetwear
router.get('/streetwear', async (req, res) => {
  try {
    const posts = await prisma.streetwearPost.findMany({
      where: { deleted_at: null, status: 'PUBLISHED' },
      orderBy: { created_at: 'desc' },
    });
    // Fallback to all if none PUBLISHED for demo purposes
    const all = posts.length ? posts : await prisma.streetwearPost.findMany({ where: { deleted_at: null }, orderBy: { created_at: 'desc' } });
    res.json({ data: all });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch streetwear posts' });
  }
});

// GET /api/content/lifestyle/graffiti
router.get('/graffiti', async (req, res) => {
  try {
    const posts = await prisma.graffitiPost.findMany({
      where: { deleted_at: null, status: 'PUBLISHED' },
      orderBy: { created_at: 'desc' },
    });
    const all = posts.length ? posts : await prisma.graffitiPost.findMany({ where: { deleted_at: null }, orderBy: { created_at: 'desc' } });
    res.json({ data: all });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch graffiti posts' });
  }
});

// GET /api/content/lifestyle/dance
router.get('/dance', async (req, res) => {
  try {
    const posts = await prisma.dancePost.findMany({
      where: { deleted_at: null, status: 'PUBLISHED' },
      orderBy: { created_at: 'desc' },
    });
    const all = posts.length ? posts : await prisma.dancePost.findMany({ where: { deleted_at: null }, orderBy: { created_at: 'desc' } });
    res.json({ data: all });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch dance posts' });
  }
});

export default router;
