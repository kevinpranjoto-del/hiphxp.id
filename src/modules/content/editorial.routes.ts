import { Router } from 'express';
import { prisma } from '../../shared/prisma';

const router = Router();

// GET /api/content/editorials/interviews
router.get('/interviews', async (req, res) => {
  try {
    const posts = await prisma.interview.findMany({
      where: { deleted_at: null, status: 'PUBLISHED' },
      orderBy: { created_at: 'desc' },
    });
    const all = posts.length ? posts : await prisma.interview.findMany({ where: { deleted_at: null }, orderBy: { created_at: 'desc' } });
    res.json({ data: all });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch interviews' });
  }
});

// GET /api/content/editorials/longforms
router.get('/longforms', async (req, res) => {
  try {
    const posts = await prisma.longform.findMany({
      where: { deleted_at: null, status: 'PUBLISHED' },
      orderBy: { created_at: 'desc' },
    });
    const all = posts.length ? posts : await prisma.longform.findMany({ where: { deleted_at: null }, orderBy: { created_at: 'desc' } });
    res.json({ data: all });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch longforms' });
  }
});

// GET /api/content/editorials/features
router.get('/features', async (req, res) => {
  try {
    const posts = await prisma.featureStory.findMany({
      where: { deleted_at: null, status: 'PUBLISHED' },
      orderBy: { created_at: 'desc' },
    });
    const all = posts.length ? posts : await prisma.featureStory.findMany({ where: { deleted_at: null }, orderBy: { created_at: 'desc' } });
    res.json({ data: all });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch feature stories' });
  }
});

export default router;
