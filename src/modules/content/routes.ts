import { Router } from 'express';
import { prisma } from '../../shared/prisma';
import { requireAuth } from '../../shared/authMiddleware';

const router = Router();

router.get('/articles', async (_req, res) => {
  try {
    const articles = await prisma.article.findMany({
      where: { deleted_at: null },
      include: { category: true, tags: { include: { tag: true } }, media_embeds: true },
      orderBy: { created_at: 'desc' },
    });
    res.json(articles);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch articles' });
  }
});

router.get('/articles/:slug', async (req, res) => {
  try {
    const article = await prisma.article.findUnique({
      where: { slug: req.params.slug },
      include: { category: true, tags: { include: { tag: true } }, media_embeds: true },
    });
    if (!article) return res.status(404).json({ message: 'Article not found' });

    await prisma.article.update({
      where: { id: article.id },
      data: { view_count: { increment: 1 } },
    });

    return res.json(article);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch article' });
  }
});

router.post('/articles', requireAuth, async (req: any, res) => {
  try {
    const article = await prisma.article.create({ data: req.body });
    res.status(201).json(article);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create article' });
  }
});

router.post('/articles/:id/media-embeds', async (req, res) => {
  try {
    const embed = await prisma.articleMediaEmbed.create({
      data: { article_id: req.params.id, ...req.body },
    });
    res.status(201).json(embed);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add media embed' });
  }
});

export default router;
