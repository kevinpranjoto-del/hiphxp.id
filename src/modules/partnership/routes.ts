import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../shared/prisma';

const router = Router();

const createPartnershipSchema = z.object({
  name: z.string().min(1),
  company: z.string().optional(),
  email: z.string().email(),
  whatsapp: z.string().optional(),
  service: z.string().optional(),
  message: z.string().optional(),
});

const updatePartnershipSchema = z.object({
  name: z.string().min(1).optional(),
  company: z.string().optional(),
  email: z.string().email().optional(),
  whatsapp: z.string().optional(),
  service: z.string().optional(),
  message: z.string().optional(),
  status: z.enum(['NEW', 'REVIEW', 'APPROVED', 'REJECTED', 'CLOSED']).optional(),
});

router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const where: any = { deleted_at: null };

    if (status && typeof status === 'string') {
      where.status = status;
    }

    const partnerships = await prisma.partnership.findMany({ where, orderBy: { created_at: 'desc' } });
    res.json(partnerships);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch partnerships' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const partnership = await prisma.partnership.findFirst({
      where: { id: req.params.id, deleted_at: null },
    });

    if (!partnership) {
      return res.status(404).json({ message: 'Partnership request not found' });
    }

    res.json(partnership);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch partnership request' });
  }
});

router.post('/', async (req, res) => {
  try {
    const parsed = createPartnershipSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid request body', errors: parsed.error.errors });
    }

    const partnership = await prisma.partnership.create({
      data: parsed.data,
    });

    res.status(201).json(partnership);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create partnership request' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const parsed = updatePartnershipSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid request body', errors: parsed.error.errors });
    }

    const partnership = await prisma.partnership.updateMany({
      where: { id: req.params.id, deleted_at: null },
      data: parsed.data,
    });

    if (partnership.count === 0) {
      return res.status(404).json({ message: 'Partnership request not found' });
    }

    const updatedPartnership = await prisma.partnership.findUnique({
      where: { id: req.params.id },
    });

    res.json(updatedPartnership);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update partnership request' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const partnership = await prisma.partnership.updateMany({
      where: { id: req.params.id, deleted_at: null },
      data: { deleted_at: new Date() },
    });

    if (partnership.count === 0) {
      return res.status(404).json({ message: 'Partnership request not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete partnership request' });
  }
});

export default router;
