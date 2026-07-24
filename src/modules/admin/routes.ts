import { Router } from 'express';
import { prisma } from '../../shared/prisma';
import bcrypt from 'bcryptjs';
import { requireAuth } from '../../shared/authMiddleware';
import { upload } from '../../utils/upload';

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

// Admin Music Reviews CRUD
router.get('/reviews', async (_req, res) => {
  try {
    const reviews = await prisma.musicReview.findMany({
      where: { deleted_at: null },
      include: { artist: true },
      orderBy: { created_at: 'desc' }
    });
    res.json(reviews);
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
});

router.post('/reviews', async (req, res) => {
  try {
    const { title, slug, content, rating, artist_id, spotify_link, youtube_link } = req.body;
    if (!title || !slug || !content || !artist_id) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const review = await prisma.musicReview.create({
      data: {
        title,
        slug,
        content,
        rating: rating ? parseFloat(rating) : null,
        artist_id,
        spotify_link: spotify_link || null,
        youtube_link: youtube_link || null
      }
    });
    res.status(201).json(review);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create review: ' + error.message });
  }
});

router.delete('/reviews/:id', async (req, res) => {
  try {
    await prisma.musicReview.update({
      where: { id: req.params.id },
      data: { deleted_at: new Date() }
    });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: 'Failed to delete review' });
  }
});

// Admin Release Radar CRUD
router.get('/radar', async (_req, res) => {
  try {
    const radars = await prisma.releaseRadar.findMany({
      where: { deleted_at: null },
      include: { artist: true },
      orderBy: { created_at: 'desc' }
    });
    res.json(radars);
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch radar posts' });
  }
});

router.post('/radar', async (req, res) => {
  try {
    const { title, slug, content, artist_id } = req.body;
    if (!title || !slug || !content || !artist_id) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const radar = await prisma.releaseRadar.create({
      data: {
        title,
        slug,
        content,
        artist_id
      }
    });
    res.status(201).json(radar);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create radar: ' + error.message });
  }
});

router.delete('/radar/:id', async (req, res) => {
  try {
    await prisma.releaseRadar.update({
      where: { id: req.params.id },
      data: { deleted_at: new Date() }
    });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: 'Failed to delete radar' });
  }
});

// Admin Lifestyle Posts CRUD
router.get('/lifestyle/:category', async (req, res) => {
  try {
    const { category } = req.params;
    let posts: any[] = [];
    if (category === 'streetwear') {
      posts = await prisma.streetwearPost.findMany({ where: { deleted_at: null }, orderBy: { created_at: 'desc' } });
    } else if (category === 'graffiti') {
      posts = await prisma.graffitiPost.findMany({ where: { deleted_at: null }, orderBy: { created_at: 'desc' } });
    } else if (category === 'dance') {
      posts = await prisma.dancePost.findMany({ where: { deleted_at: null }, orderBy: { created_at: 'desc' } });
    } else if (category === 'sport') {
      posts = await prisma.sportPost.findMany({ where: { deleted_at: null }, orderBy: { created_at: 'desc' } });
    } else if (category === 'beatbox') {
      posts = await prisma.beatboxPost.findMany({ where: { deleted_at: null }, orderBy: { created_at: 'desc' } });
    }
    res.json(posts);
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch lifestyle posts' });
  }
});

router.post('/lifestyle/:category', upload.single('image'), async (req: any, res) => {
  try {
    const { category } = req.params;
    const { title, slug, content, city, province } = req.body;
    if (!title || !slug || !content) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    let featured_image = null;
    if (req.file) {
      featured_image = `/public/uploads/images/${req.file.filename}`;
    }
    let post;
    const data = { title, slug, content, city, province, featured_image, status: 'PUBLISHED' as any };
    if (category === 'streetwear') {
      post = await prisma.streetwearPost.create({ data });
    } else if (category === 'graffiti') {
      post = await prisma.graffitiPost.create({ data });
    } else if (category === 'dance') {
      post = await prisma.dancePost.create({ data });
    } else if (category === 'sport') {
      post = await prisma.sportPost.create({ data });
    } else if (category === 'beatbox') {
      post = await prisma.beatboxPost.create({ data });
    } else {
      return res.status(400).json({ message: 'Invalid category' });
    }
    res.status(201).json(post);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create post: ' + error.message });
  }
});

router.delete('/lifestyle/:category/:id', async (req, res) => {
  try {
    const { category, id } = req.params;
    const data = { deleted_at: new Date() };
    if (category === 'streetwear') {
      await prisma.streetwearPost.update({ where: { id }, data });
    } else if (category === 'graffiti') {
      await prisma.graffitiPost.update({ where: { id }, data });
    } else if (category === 'dance') {
      await prisma.dancePost.update({ where: { id }, data });
    } else if (category === 'sport') {
      await prisma.sportPost.update({ where: { id }, data });
    } else if (category === 'beatbox') {
      await prisma.beatboxPost.update({ where: { id }, data });
    } else {
      return res.status(400).json({ message: 'Invalid category' });
    }
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: 'Failed to delete post' });
  }
});

// Admin Interviews CRUD
router.get('/interviews', async (_req, res) => {
  try {
    const interviews = await prisma.interview.findMany({
      where: { deleted_at: null },
      orderBy: { created_at: 'desc' }
    });
    res.json(interviews);
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch interviews' });
  }
});

router.post('/interviews', upload.single('image'), async (req: any, res) => {
  try {
    const { title, slug, content } = req.body;
    if (!title || !slug || !content) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    let featured_image = null;
    if (req.file) {
      featured_image = `/public/uploads/images/${req.file.filename}`;
    }
    const interview = await prisma.interview.create({
      data: { title, slug, content, featured_image, status: 'PUBLISHED' as any }
    });
    res.status(201).json(interview);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create interview: ' + error.message });
  }
});

router.delete('/interviews/:id', async (req, res) => {
  try {
    await prisma.interview.update({
      where: { id: req.params.id },
      data: { deleted_at: new Date() }
    });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: 'Failed to delete interview' });
  }
});

// Admin Artists Dropdown helper
router.get('/artists', async (_req, res) => {
  try {
    const artists = await prisma.artist.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(artists);
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch artists' });
  }
});

export default router;
