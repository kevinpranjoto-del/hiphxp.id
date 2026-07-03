"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../../shared/prisma");
const router = (0, express_1.Router)();
router.get('/stats', async (_req, res) => {
    try {
        const [articles, artists, songs, events, partnerships, inquiries, views, users] = await Promise.all([
            prisma_1.prisma.article.count({ where: { deleted_at: null } }),
            prisma_1.prisma.artist.count({ where: { deleted_at: null } }),
            prisma_1.prisma.song.count({ where: { deleted_at: null } }),
            prisma_1.prisma.event.count({ where: { deleted_at: null } }),
            prisma_1.prisma.partnership.count({ where: { deleted_at: null } }),
            prisma_1.prisma.partnership.count({ where: { deleted_at: null } }),
            prisma_1.prisma.article.aggregate({ where: { deleted_at: null }, _sum: { view_count: true } }),
            prisma_1.prisma.user.count({ where: { deleted_at: null } }),
        ]);
        res.json({
            articles,
            artists,
            music: songs,
            events,
            partnerships,
            inquiries,
            views: views._sum.view_count || 0,
            users,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch dashboard stats' });
    }
});
exports.default = router;
