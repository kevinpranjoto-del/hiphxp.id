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
        song_meaning: true,
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
    const { title, slug: rawSlug, genre_id, producer_id, release_date, meaning } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Judul lagu wajib diisi.' });
    }

    let finalSlug = slugify(rawSlug || title);
    if (!finalSlug) finalSlug = `song-${Date.now()}`;

    // Check slug collision and generate unique slug if needed
    const existing = await prisma.song.findUnique({ where: { slug: finalSlug } });
    if (existing) {
      finalSlug = `${finalSlug}-${Math.random().toString(36).substring(2, 7)}`;
    }

    // Ambil profile musisi untuk menemukan/membuat Artist
    const profile = await prisma.musicianProfile.findUnique({
      where: { user_id: req.user.sub }
    });

    if (!profile || !profile.artist_name || !profile.artist_name.trim()) {
      return res.status(400).json({ message: 'Lengkapi nama panggung (artist name) di profil Anda terlebih dahulu sebelum mengunggah lagu.' });
    }

    const artistName = profile.artist_name.trim();
    let artistSlug = slugify(artistName);
    if (!artistSlug) artistSlug = `artist-${req.user.sub.substring(0, 8)}`;

    let artist = await prisma.artist.findUnique({ where: { slug: artistSlug } });

    if (!artist) {
      // Buat data artist baru jika belum ada
      artist = await prisma.artist.create({
        data: {
          name: artistName,
          slug: artistSlug,
          real_name: profile.real_name || null,
          bio: profile.bio || null,
          city: profile.city || null,
          instagram: profile.instagram || null,
          spotify: profile.spotify_artist_url || null,
          whatsapp: profile.whatsapp || null,
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
        title: title.trim(),
        slug: finalSlug,
        artist_id: artist.id,
        user_id: req.user.sub,
        genre_id: genre_id || null,
        producer_id: producer_id || null,
        audio_url: audio_url || null,
        cover_image: cover_image || null,
        release_date: release_date ? new Date(release_date) : null,
        ...(meaning ? {
          song_meaning: {
            create: {
              content: meaning.trim()
            }
          }
        } : {})
      },
      include: { artist: true, genre: true, producer: true, song_meaning: true },
    });

    return res.status(201).json(song);
  } catch (error: any) {
    console.error('[POST /api/songs] Error:', error?.message || error);
    return res.status(500).json({ message: `Gagal menambahkan lagu: ${error?.message || error}` });
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

    await prisma.song.update({
      where: { id: req.params.id },
      data: { deleted_at: new Date() }
    });

    return res.json({ message: 'Song deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to delete song' });
  }
});

export default router;
