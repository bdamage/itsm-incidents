const express = require('express');
const router = express.Router();
const KnowledgeArticle = require('../models/knowledgeArticle');
const requireAdmin = require('../middleware/requireAdmin');

// list/search articles (public)
router.get('/', async (req, res) => {
  const { q, category, knowledgeBase, page = 1, limit = 20 } = req.query;
  const filter = { published: true };

  if (knowledgeBase) filter.knowledgeBase = knowledgeBase;
  if (category) filter.category = category;

  if (q && String(q).trim()) {
    const re = new RegExp(String(q).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [
      { title: re },
      { shortDescription: re },
      { description: re },
      { tags: re }
    ];
  }

  const skip = (Math.max(Number(page), 1) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    KnowledgeArticle.find(filter)
      .populate('owner knowledgeBase', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    KnowledgeArticle.countDocuments(filter)
  ]);

  res.json({ items, total, page: Number(page), limit: Number(limit) });
});

// get single article (public)
router.get('/:id', async (req, res) => {
  const item = await KnowledgeArticle.findById(req.params.id).populate('owner knowledgeBase', 'name email');
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json(item);
});

// admin create
router.post('/', requireAdmin, async (req, res) => {
  const payload = req.body;
  if (!payload.title || !payload.shortDescription || !payload.description || !payload.knowledgeBase || !payload.owner) {
    return res.status(400).json({ message: 'missing required fields' });
  }
  const created = await KnowledgeArticle.create(payload);
  const populated = await KnowledgeArticle.findById(created._id).populate('owner knowledgeBase', 'name email');
  res.status(201).json(populated);
});

// admin update
router.put('/:id', requireAdmin, async (req, res) => {
  const updated = await KnowledgeArticle.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate(
    'owner knowledgeBase',
    'name email'
  );
  if (!updated) return res.status(404).json({ message: 'Not found' });
  res.json(updated);
});

// admin delete
router.delete('/:id', requireAdmin, async (req, res) => {
  await KnowledgeArticle.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

module.exports = router;