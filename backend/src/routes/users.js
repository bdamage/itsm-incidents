const express = require('express');
const User = require('../models/user');

const router = express.Router();

// List users (basic pagination & search)
router.get('/', async (req, res) => {
  const { q = '', page = 1, limit = 20 } = req.query;
  const query = q
    ? { $or: [{ name: new RegExp(q, 'i') }, { email: new RegExp(q, 'i') }] }
    : {};
  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    User.find(query).sort({ name: 1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(query)
  ]);
  res.json({ items, total, page: Number(page), limit: Number(limit) });
});

// Create user
router.post('/', async (req, res) => {
  const { name, email, role } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'name and email are required' });
  const user = await User.create({ name, email, role });
  res.status(201).json(user);
});

module.exports = router;