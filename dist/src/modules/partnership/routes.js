"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("../../shared/prisma");
const router = (0, express_1.Router)();
const createPartnershipSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    company: zod_1.z.string().optional(),
    email: zod_1.z.string().email(),
    whatsapp: zod_1.z.string().optional(),
    service: zod_1.z.string().optional(),
    message: zod_1.z.string().optional(),
});
const updatePartnershipSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    company: zod_1.z.string().optional(),
    email: zod_1.z.string().email().optional(),
    whatsapp: zod_1.z.string().optional(),
    service: zod_1.z.string().optional(),
    message: zod_1.z.string().optional(),
    status: zod_1.z.enum(['NEW', 'REVIEW', 'APPROVED', 'REJECTED', 'CLOSED']).optional(),
});
router.get('/', async (req, res) => {
    try {
        const { status } = req.query;
        const where = { deleted_at: null };
        if (status && typeof status === 'string') {
            where.status = status;
        }
        const partnerships = await prisma_1.prisma.partnership.findMany({ where, orderBy: { created_at: 'desc' } });
        res.json(partnerships);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch partnerships' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const partnership = await prisma_1.prisma.partnership.findFirst({
            where: { id: req.params.id, deleted_at: null },
        });
        if (!partnership) {
            return res.status(404).json({ message: 'Partnership request not found' });
        }
        res.json(partnership);
    }
    catch (error) {
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
        const partnership = await prisma_1.prisma.partnership.create({
            data: parsed.data,
        });
        res.status(201).json(partnership);
    }
    catch (error) {
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
        const partnership = await prisma_1.prisma.partnership.updateMany({
            where: { id: req.params.id, deleted_at: null },
            data: parsed.data,
        });
        if (partnership.count === 0) {
            return res.status(404).json({ message: 'Partnership request not found' });
        }
        const updatedPartnership = await prisma_1.prisma.partnership.findUnique({
            where: { id: req.params.id },
        });
        res.json(updatedPartnership);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update partnership request' });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const partnership = await prisma_1.prisma.partnership.updateMany({
            where: { id: req.params.id, deleted_at: null },
            data: { deleted_at: new Date() },
        });
        if (partnership.count === 0) {
            return res.status(404).json({ message: 'Partnership request not found' });
        }
        res.status(204).send();
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to delete partnership request' });
    }
});
exports.default = router;
