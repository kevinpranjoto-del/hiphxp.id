import { Router } from 'express';
import { prisma } from '../../shared/prisma';
import { requireAuth } from '../../shared/authMiddleware';
import { upload } from '../../utils/upload';

const router = Router();

// GET /api/events — list all events (only ACTIVE/PUBLISHED events for public)
router.get('/', async (req, res) => {
  try {
    const { city, category, startDate, endDate } = req.query;
    const where: any = { 
      deleted_at: null,
      status: 'PUBLISHED' // only active events for public
    };

    if (city) where.city = city;
    if (category) where.category = category;
    if (startDate || endDate) {
      where.event_date = {};
      if (startDate) where.event_date.gte = new Date(startDate as string);
      if (endDate) where.event_date.lte = new Date(endDate as string);
    }

    const events = await prisma.event.findMany({ where, orderBy: { event_date: 'asc' } });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch events' });
  }
});

// GET /api/events/me — list events owned by logged-in user
router.get('/me', requireAuth, async (req: any, res) => {
  try {
    const events = await prisma.event.findMany({
      where: { deleted_at: null, user_id: req.user.sub },
      orderBy: { event_date: 'asc' }
    });
    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch your events' });
  }
});

// POST /api/events — create event
router.post('/', requireAuth, upload.single('poster'), async (req: any, res) => {
  try {
    const { title, name, slug, category, event_date, city, location, venue, image_url } = req.body;

    const eventName = title || name;
    const eventVenue = location || venue;

    if (!eventName || !slug || !category) {
      return res.status(400).json({ message: 'Missing required fields: title/name, slug, category' });
    }

    const existing = await prisma.event.findUnique({ where: { slug } });
    if (existing) {
      return res.status(409).json({ message: 'Event with this slug already exists' });
    }

    let finalImageUrl = image_url || null;
    if (req.file) {
      finalImageUrl = `/public/uploads/images/${req.file.filename}`;
    }

    const event = await prisma.event.create({
      data: {
        name: eventName,
        slug,
        category,
        event_date: event_date ? new Date(event_date) : null,
        city,
        venue: eventVenue || null,
        image_url: finalImageUrl,
        user_id: req.user.sub,
        status: 'PUBLISHED' // automatically active when posted by musician
      }
    });
    res.status(201).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create event' });
  }
});

// PATCH /api/events/:id — update event status or metadata
router.patch('/:id', requireAuth, async (req: any, res) => {
  try {
    const { title, name, slug, category, event_date, city, location, venue, image_url, status } = req.body;

    const existing = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deleted_at) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (existing.user_id !== req.user.sub) {
      return res.status(403).json({ message: 'Forbidden: You do not own this event' });
    }

    const eventName = title || name;
    const eventVenue = location || venue;

    const event = await prisma.event.update({
      where: { id: req.params.id },
      data: {
        ...(eventName && { name: eventName }),
        ...(slug && { slug }),
        ...(category && { category }),
        ...(event_date !== undefined && { event_date: event_date ? new Date(event_date) : null }),
        ...(city !== undefined && { city }),
        ...(eventVenue !== undefined && { venue: eventVenue }),
        ...(image_url !== undefined && { image_url }),
        ...(status !== undefined && { status }),
      }
    });

    res.json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update event' });
  }
});

// DELETE /api/events/:id — soft delete event
router.delete('/:id', requireAuth, async (req: any, res) => {
  try {
    const existing = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deleted_at) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (existing.user_id !== req.user.sub) {
      return res.status(403).json({ message: 'Forbidden: You do not own this event' });
    }

    await prisma.event.update({
      where: { id: req.params.id },
      data: { deleted_at: new Date() }
    });

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete event' });
  }
});

export default router;
