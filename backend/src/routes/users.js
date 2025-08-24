const express = require('express');
const User = require('../models/user');
const { Incident } = require('../models/incident');
var mongoose = require("mongoose");

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

// Summary: count open tickets and list (incidents + requests) for a user
router.get('/:id/tickets', async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 20 } = req.query;
console.log('User tickets for', id);

  // treat "open" as states not resolved/closed/canceled
  const closedStates = ['Resolved', 'Closed', 'Canceled'];
  const filter = { caller: id, state: { $nin: closedStates } };

  const skip = (Math.max(Number(page), 1) - 1) * Number(limit);

  const [items, total] = await Promise.all([
    Incident.find(filter).populate('assignmentGroup assignedTo caller').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Incident.countDocuments(filter)
  ]);

  // also provide counts by ticketType (incident/request)
  const counts = await Incident.aggregate([
    { $match: { caller: new mongoose.Types.ObjectId(id), state: { $nin: closedStates } } },
    { $group: { _id: '$ticketType', count: { $sum: 1 } } }
  ]);

  const summary = counts.reduce((acc, cur) => {
    acc[cur._id] = cur.count;
    return acc;
  }, {});

  res.json({ items, total, page: Number(page), limit: Number(limit), summary });
});

module.exports = router;