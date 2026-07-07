import { Router } from 'express';
import { prisma } from '../../shared/prisma';
import { requireAuth } from '../../shared/authMiddleware';

const router = Router();

// GET /api/users — list semua user (tanpa password_hash)
router.get('/', async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { deleted_at: null },
      select: {
        id: true,
        email: true,
        account_type: true,
        is_active: true,
        email_verified: true,
        last_login_at: true,
        created_at: true,
        updated_at: true,
        role: true,
        musician_profile: true,
      },
      orderBy: { created_at: 'desc' },
    });
    res.json({ data: users, total: users.length });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// GET /api/users/:id — detail user beserta musician_profile
router.get('/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        email: true,
        account_type: true,
        is_active: true,
        email_verified: true,
        last_login_at: true,
        created_at: true,
        updated_at: true,
        deleted_at: true,
        role: true,
        musician_profile: true,
        author: true,
      },
    });

    if (!user || user.deleted_at) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch user' });
  }
});

// PATCH /api/users/:id — update user (only self, or admin)
router.patch('/:id', requireAuth, async (req: any, res) => {
  try {
    // Ownership check: users can only update themselves
    if (req.user.sub !== req.params.id) {
      return res.status(403).json({ message: 'Forbidden: You can only update your own account' });
    }

    const { email, is_active, account_type } = req.body;

    const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deleted_at) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        ...(email && { email }),
        ...(is_active !== undefined && { is_active }),
        ...(account_type && { account_type }),
      },
      select: {
        id: true,
        email: true,
        account_type: true,
        is_active: true,
        email_verified: true,
        updated_at: true,
        role: true,
        musician_profile: true,
      },
    });

    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update user' });
  }
});

// DELETE /api/users/:id — soft delete user (only self)
router.delete('/:id', requireAuth, async (req: any, res) => {
  try {
    // Ownership check
    if (req.user.sub !== req.params.id) {
      return res.status(403).json({ message: 'Forbidden: You can only delete your own account' });
    }

    const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deleted_at) {
      return res.status(404).json({ message: 'User not found' });
    }

    await prisma.user.update({
      where: { id: req.params.id },
      data: { deleted_at: new Date() },
    });

    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete user' });
  }
});

export default router;
