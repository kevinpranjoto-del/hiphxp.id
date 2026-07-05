import { Router } from 'express';
import { prisma } from '../../shared/prisma';

const router = Router();

// GET /api/songs — list semua lagu
router.get('/', async (_req, res) => {
  try {
    const songs = await prisma.song.findMany({
      where: { deleted_at: null },
      include: {
        artist: true,
        genre: true,
        producer: true,
      },
      orderBy: { created_at: 'desc' },
    });
    res.json({ data: songs, total: songs.length });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch songs' });
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
    if (!song || song.deleted_at) {
      return res.status(404).json({ message: 'Song not found' });
    }
    return res.json(song);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch song' });
  }
});

// POST /api/songs — tambah lagu baru
router.post('/', async (req, res) => {
  try {
    const { title, slug, artist_id, genre_id, producer_id, audio_url, cover_image, release_date } = req.body;

    if (!title || !slug || !artist_id) {
      return res.status(400).json({ message: 'Missing required fields: title, slug, artist_id' });
    }

    const existing = await prisma.song.findUnique({ where: { slug } });
    if (existing) {
      return res.status(409).json({ message: 'Song with this slug already exists' });
    }

    const song = await prisma.song.create({
      data: {
        title,
        slug,
        artist_id,
        genre_id: genre_id || null,
        producer_id: producer_id || null,
        audio_url: audio_url || null,
        cover_image: cover_image || null,
        release_date: release_date ? new Date(release_date) : null,
      },
      include: { artist: true, genre: true, producer: true },
    });

    return res.status(201).json(song);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create song' });
  }
});

// PATCH /api/songs/:id — update lagu
router.patch('/:id', async (req, res) => {
  try {
    const { title, slug, genre_id, producer_id, audio_url, cover_image, release_date } = req.body;

    const existing = await prisma.song.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deleted_at) {
      return res.status(404).json({ message: 'Song not found' });
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
        ...(release_date !== undefined && { release_date: release_date ? new Date(release_date) : null }),
      },
      include: { artist: true, genre: true, producer: true },
    });

    return res.json(song);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update song' });
  }
});

// DELETE /api/songs/:id — soft delete
router.delete('/:id', async (req, res) => {
  try {
    const existing = await prisma.song.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deleted_at) {
      return res.status(404).json({ message: 'Song not found' });
    }

    await prisma.song.update({
      where: { id: req.params.id },
      data: { deleted_at: new Date() },
    });

    return res.json({ message: 'Song deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete song' });
  }
});

export default router;
