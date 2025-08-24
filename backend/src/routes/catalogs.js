const express = require('express');
const router = express.Router();
const Catalog = require('../models/catalog');
const CatalogItem = require('../models/catalogItem');

// list catalogs
router.get('/', async (req, res) => {
  const { q } = req.query;
  const filter = {};
  if (q && String(q).trim()) {
    const re = new RegExp(String(q).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: re }, { description: re }];
  }
  const items = await Catalog.find(filter).sort({ name: 1 });
  res.json(items);
});



// list/search catalog items globally
router.get('/items', async (req, res) => {
  const { q, category, catalog, page = 1, limit = 20 } = req.query;

  const filter = { available: true };
/*  if (catalog) {
    const mongoose = require('mongoose');
    if (mongoose.Types.ObjectId.isValid(catalog)) {
      filter.catalog = catalog;
    } else {
      return res.status(400).json({ message: 'Invalid catalog id' });
    }
  }*/
  if (category) filter.category = category;
  if (q && String(q).trim()) {
    const re = new RegExp(String(q).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ title: re }, { shortDescription: re }, { description: re }, { category: re }];
  }
  const skip = (Math.max(Number(page), 1) - 1) * Number(limit);

  const [items, total] = await Promise.all([
  
    CatalogItem.find(filter).populate('catalog knowledgeArticle', 'name title').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    CatalogItem.countDocuments(filter)
  ]);
  res.json({ items, total, page: Number(page), limit: Number(limit) });

});


// get single catalog with items
router.get('/:id', async (req, res) => {
  const catalog = await Catalog.findById(req.params.id);
  if (!catalog) return res.status(404).json({ message: 'Catalog not found' });
  const items = await CatalogItem.find({ catalog: catalog._id, available: true }).sort({ createdAt: -1 }).limit(200);
  res.json({ catalog, items });
});

module.exports = router;