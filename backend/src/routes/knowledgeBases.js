const express = require('express');
const router = express.Router();
const KnowledgeBase = require('../models/knowledgeBase');
const requireAdmin = require('../middleware/requireAdmin');

// list bases
router.get('/', async (req, res) => {
  const items = await KnowledgeBase.find().sort({ name: 1 });
  res.json(items);
});

// create base (admin)
router.post('/', requireAdmin, async (req, res) => {
  const { name, description, createdBy } = req.body;
  if (!name) return res.status(400).json({ message: 'name required' });
  const created = await KnowledgeBase.create({ name, description, createdBy });
  res.status(201).json(created);
});

module.exports = router;