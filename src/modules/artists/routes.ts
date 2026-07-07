import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../../shared/prisma';
import { requireAuth } from '../../shared/authMiddleware';
import { upload } from '../../utils/upload';

const router = Router();

// GET /api/artists — list semua artist, filter by city/province/is_verified
router.get('/', async (req, res) => {
  try {
    const { city, province, is_verified } = req.query;
    const where: any = { deleted_at: null };

    if (city) where.city = { contains: city as string, mode: 'insensitive' };
    if (province) where.province = { contains: province as string, mode: 'insensitive' };
    if (is_verified !== undefined) where.is_verified = is_verified === 'true';

    const artists = await prisma.artist.findMany({
      where,
      include: { genre: true, label: true },
      orderBy: { created_at: 'desc' },
    });
    res.json({ data: artists, total: artists.length });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch artists' });
  }
});

// GET /api/artists/:slug — detail artist beserta songs, reviews
router.get('/:slug', async (req, res) => {
  try {
    const artist = await prisma.artist.findUnique({
      where: { slug: req.params.slug },
      include: {
        genre: true,
        label: true,
        songs: {
          where: { deleted_at: null },
          orderBy: { created_at: 'desc' },
          take: 10,
        },
        albums: {
          where: { deleted_at: null },
          orderBy: { release_date: 'desc' },
          take: 5,
        },
        music_reviews: {
          where: { deleted_at: null },
          orderBy: { created_at: 'desc' },
          take: 5,
        },
        release_radar: {
          where: { deleted_at: null },
          orderBy: { release_date: 'desc' },
          take: 5,
        },
      },
    });

    if (!artist || artist.deleted_at) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    return res.json(artist);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch artist' });
  }
});

// GET /api/artists/me/profile — dapatkan profil sendiri
router.get('/me/profile', requireAuth, async (req: any, res) => {
  try {
    const userId = req.user.sub;
    let profile = await prisma.musicianProfile.findUnique({
      where: { user_id: userId },
      include: { user: { select: { email: true } } }
    });
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    return res.json(profile);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to get profile' });
  }
});

// PUT /api/artists/me/profile — update profil sendiri
router.put('/me/profile', requireAuth, upload.single('profile_photo'), async (req: any, res) => {
  try {
    const userId = req.user.sub;
    const { artist_name, real_name, bio, city, whatsapp, instagram, spotify_artist_url } = req.body;
    
    let profile_photo = undefined;
    if (req.file) {
      profile_photo = `/public/uploads/images/${req.file.filename}`;
    }

    const profile = await prisma.musicianProfile.upsert({
      where: { user_id: userId },
      update: {
        artist_name,
        real_name,
        bio,
        city,
        whatsapp,
        instagram,
        spotify_artist_url,
        ...(profile_photo && { profile_photo })
      },
      create: {
        user_id: userId,
        artist_name: artist_name || req.user.email?.split('@')[0] || 'Unknown',
        real_name: real_name || '',
        bio,
        city,
        whatsapp,
        instagram,
        spotify_artist_url,
        ...(profile_photo && { profile_photo })
      }
    });

    return res.json(profile);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to update profile' });
  }
});

// POST /api/artists — tambah artist baru (requires auth)
router.post('/', requireAuth, async (req: any, res) => {
  try {
    const {
      name, slug, real_name, bio, city, province,
      genre_id, label_id, instagram, tiktok, youtube,
      spotify, website, whatsapp, email,
    } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ message: 'Missing required fields: name, slug' });
    }

    const existing = await prisma.artist.findUnique({ where: { slug } });
    if (existing) {
      return res.status(409).json({ message: 'Artist with this slug already exists' });
    }

    const artist = await prisma.artist.create({
      data: {
        name, slug,
        real_name: real_name || null,
        bio: bio || null,
        city: city || null,
        province: province || null,
        genre_id: genre_id || null,
        label_id: label_id || null,
        instagram: instagram || null,
        tiktok: tiktok || null,
        youtube: youtube || null,
        spotify: spotify || null,
        website: website || null,
        whatsapp: whatsapp || null,
        email: email || null,
      },
      include: { genre: true, label: true },
    });

    return res.status(201).json(artist);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create artist' });
  }
});

// PATCH /api/artists/:id — update artist (requires auth)
router.patch('/:id', requireAuth, async (req: any, res) => {
  try {
    const existing = await prisma.artist.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deleted_at) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    const {
      name, slug, real_name, bio, city, province,
      genre_id, label_id, instagram, tiktok, youtube,
      spotify, website, whatsapp, email, is_verified,
    } = req.body;

    const artist = await prisma.artist.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(real_name !== undefined && { real_name }),
        ...(bio !== undefined && { bio }),
        ...(city !== undefined && { city }),
        ...(province !== undefined && { province }),
        ...(genre_id !== undefined && { genre_id }),
        ...(label_id !== undefined && { label_id }),
        ...(instagram !== undefined && { instagram }),
        ...(tiktok !== undefined && { tiktok }),
        ...(youtube !== undefined && { youtube }),
        ...(spotify !== undefined && { spotify }),
        ...(website !== undefined && { website }),
        ...(whatsapp !== undefined && { whatsapp }),
        ...(email !== undefined && { email }),
        ...(is_verified !== undefined && { is_verified }),
      },
      include: { genre: true, label: true },
    });

    return res.json(artist);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update artist' });
  }
});

// DELETE /api/artists/:id — soft delete (requires auth)
router.delete('/:id', requireAuth, async (req: any, res) => {
  try {
    const existing = await prisma.artist.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deleted_at) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    await prisma.artist.update({
      where: { id: req.params.id },
      data: { deleted_at: new Date() },
    });

    return res.json({ message: 'Artist deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete artist' });
  }
});

export default router;
