import { Router } from 'express';
import { prisma } from '../../shared/prisma';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { city, category, startDate, endDate } = req.query;
    const where: any = { deleted_at: null };

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

router.post('/', async (req, res) => {
  try {
    const event = await prisma.event.create({ data: req.body });
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create event' });
  }
});

export default router;
