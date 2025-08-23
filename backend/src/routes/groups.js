const express = require('express');
const Group = require('../models/group');

const router = express.Router();

// List groups
router.get('/', async (req, res) => {
  const { q = '' } = req.query;
  const query = q ? { name: new RegExp(q, 'i') } : {};
  const items = await Group.find(query).sort({ name: 1 });
  res.json({ items, total: items.length });
});

// Create group
router.post('/', async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const group = await Group.create({ name, description });
  res.status(201).json(group);
});

module.exports = router;