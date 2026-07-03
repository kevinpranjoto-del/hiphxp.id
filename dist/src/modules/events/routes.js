"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../../shared/prisma");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const { city, category, startDate, endDate } = req.query;
        const where = { deleted_at: null };
        if (city)
            where.city = city;
        if (category)
            where.category = category;
        if (startDate || endDate) {
            where.event_date = {};
            if (startDate)
                where.event_date.gte = new Date(startDate);
            if (endDate)
                where.event_date.lte = new Date(endDate);
        }
        const events = await prisma_1.prisma.event.findMany({ where, orderBy: { event_date: 'asc' } });
        res.json(events);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch events' });
    }
});
router.post('/', async (req, res) => {
    try {
        const event = await prisma_1.prisma.event.create({ data: req.body });
        res.status(201).json(event);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to create event' });
    }
});
exports.default = router;
