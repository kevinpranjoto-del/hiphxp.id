import { Router } from 'express';
import { prisma } from '../../shared/prisma';
import { upload } from '../../utils/upload';
import { requireAuth } from '../../shared/authMiddleware';

const router = Router();

// Helper slugify
const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

// GET /api/songs — list semua lagu (hanya yang tidak di-hide)
router.get('/', async (_req, res) => {
  try {
    const songs = await prisma.song.findMany({
      where: { deleted_at: null, is_hidden: false },
      include: {
        artist: true,
        genre: true,
        producer: true,
      },
      orderBy: { created_at: 'desc' },
    });
    res.json({ data: songs, total: songs.length });
  } catch (error) {
    console.error('[GET /api/songs] Prisma error:', error);
    res.status(500).json({ message: 'Failed to fetch songs' });
  }
});

// GET /api/songs/me — list lagu milik user yang login
router.get('/me', requireAuth, async (req: any, res) => {
  try {
    const songs = await prisma.song.findMany({
      where: { deleted_at: null, user_id: req.user.sub },
      include: {
        artist: true,
        genre: true,
        producer: true,
      },
      orderBy: { created_at: 'desc' },
    });
    res.json({ data: songs, total: songs.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch your songs' });
  }
});

// GET /api/songs/:slug — detail satu lagu
router.get('/:slug', async (req, res) => {
  try {
    const song = await prisma.song.findUnique({
      where: { slug: req.params.slug },
      include: {
        artist: true,
        genre: true,
        producer: true,
        lyrics: true,
        song_meaning: true,
      },
    });
    if (!song || song.deleted_at || song.is_hidden) {
      return res.status(404).json({ message: 'Song not found' });
    }
    return res.json(song);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch song' });
  }
});

// POST /api/songs — tambah lagu baru
router.post('/', requireAuth, upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), async (req: any, res) => {
  try {
    const { title, slug, genre_id, producer_id, release_date } = req.body;

    if (!title || !slug) {
      return res.status(400).json({ message: 'Missing required fields: title, slug' });
    }

    const existing = await prisma.song.findUnique({ where: { slug } });
    if (existing) {
      return res.status(409).json({ message: 'Song with this slug already exists' });
    }

    // Ambil profile musisi untuk menemukan/membuat Artist
    const profile = await prisma.musicianProfile.findUnique({
      where: { user_id: req.user.sub }
    });

    if (!profile) {
      return res.status(400).json({ message: 'Lengkapi profil musisi Anda terlebih dahulu sebelum mengunggah lagu.' });
    }

    const artistSlug = slugify(profile.artist_name);
    let artist = await prisma.artist.findUnique({ where: { slug: artistSlug } });

    if (!artist) {
      // Buat data artist baru jika belum ada
      artist = await prisma.artist.create({
        data: {
          name: profile.artist_name,
          slug: artistSlug,
          real_name: profile.real_name,
          bio: profile.bio,
          city: profile.city,
          instagram: profile.instagram,
          spotify: profile.spotify_artist_url,
          whatsapp: profile.whatsapp,
        }
      });
    }
    
    let audio_url = null;
    let cover_image = null;
    
    if (req.files) {
      if (req.files.audio && req.files.audio[0]) {
        audio_url = `/public/uploads/audio/${req.files.audio[0].filename}`;
      }
      if (req.files.cover && req.files.cover[0]) {
        cover_image = `/public/uploads/images/${req.files.cover[0].filename}`;
      }
    }

    const song = await prisma.song.create({
      data: {
        title,
        slug,
        artist_id: artist.id,
        user_id: req.user.sub,
        genre_id: genre_id || null,
        producer_id: producer_id || null,
        audio_url: audio_url || null,
        cover_image: cover_image || null,
        release_date: release_date ? new Date(release_date) : null,
      },
      include: { artist: true, genre: true, producer: true },
    });

    return res.status(201).json(song);
  } catch (error: any) {
    console.error('[POST /api/songs] Prisma error:', error?.message || error);
    return res.status(500).json({ message: `Failed to create song: ${error?.message || error}` });
  }
});

// PATCH /api/songs/:id — update lagu (termasuk status hide)
router.patch('/:id', requireAuth, async (req: any, res) => {
  try {
    const { title, slug, genre_id, producer_id, audio_url, cover_image, release_date, is_hidden } = req.body;

    const existing = await prisma.song.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deleted_at) {
      return res.status(404).json({ message: 'Song not found' });
    }

    // Validasi kepemilikan
    if (existing.user_id !== req.user.sub) {
      return res.status(403).json({ message: 'Forbidden: You do not own this song' });
    }

    const song = await prisma.song.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(slug && { slug }),
        ...(genre_id !== undefined && { genre_id }),
        ...(producer_id !== undefined && { producer_id }),
        ...(audio_url !== undefined && { audio_url }),
        ...(cover_image !== undefined && { cover_image }),
        ...(is_hidden !== undefined && { is_hidden: is_hidden === true || is_hidden === 'true' }),
        ...(release_date !== undefined && { release_date: release_date ? new Date(release_date) : null }),
      },
      include: { artist: true, genre: true, producer: true },
    });

    return res.json(song);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to update song' });
  }
});

// DELETE /api/songs/:id — soft delete
router.delete('/:id', requireAuth, async (req: any, res) => {
  try {
    const existing = await prisma.song.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deleted_at) {
      return res.status(404).json({ message: 'Song not found' });
    }

    // Validasi kepemilikan
    if (existing.user_id !== req.user.sub) {
      return res.status(403).json({ message: 'Forbidden: You do not own this song' });
    }

    await prisma.song.delete({
      where: { id: req.params.id },
    });

    return res.json({ message: 'Song deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to delete song' });
  }
});

export default router;
