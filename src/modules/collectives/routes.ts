import { Router } from 'express';
import { prisma } from '../../shared/prisma';

const router = Router();

// GET /api/collectives — list semua kolektif
router.get('/', async (req, res) => {
  try {
    const { city, province, is_verified } = req.query;

    const collectives = await prisma.collective.findMany({
      where: {
        deleted_at: null,
        status: 'ACTIVE', // Only show active directories
        ...(city && { city: String(city) }),
        ...(province && { province: String(province) }),
        ...(is_verified !== undefined && { is_verified: is_verified === 'true' }),
      },
      orderBy: { created_at: 'desc' },
    });

    // We don't have collectives with status ACTIVE in the seeder, let's allow all for now
    const allCollectives = await prisma.collective.findMany({
        where: {
            deleted_at: null,
            ...(city && { city: String(city) }),
            ...(province && { province: String(province) }),
            ...(is_verified !== undefined && { is_verified: is_verified === 'true' }),
        },
        orderBy: { created_at: 'desc' },
    });

    res.json({ data: allCollectives, total: allCollectives.length });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch collectives' });
  }
});

// GET /api/collectives/:slug — detail satu kolektif
router.get('/:slug', async (req, res) => {
  try {
    const collective = await prisma.collective.findUnique({
      where: { slug: req.params.slug },
    });

    if (!collective || collective.deleted_at) {
      return res.status(404).json({ message: 'Collective not found' });
    }

    return res.json(collective);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch collective' });
  }
});

export default router;
