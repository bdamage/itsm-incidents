const express = require('express');
const router = express.Router();
const Workflow = require('../models/workflow');
const requireAdmin = require('../middleware/requireAdmin');

// list workflows
router.get('/', async (req, res) => {
  const items = await Workflow.find().sort({ createdAt: -1 });
  res.json(items);
});

// get single
router.get('/:id', async (req, res) => {
  const item = await Workflow.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json(item);
});

// create (admin)
router.post('/', requireAdmin, async (req, res) => {
  const payload = req.body;
  const created = await Workflow.create(payload);
  res.status(201).json(created);
});

// update (admin)
router.put('/:id', requireAdmin, async (req, res) => {
  const updated = await Workflow.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updated) return res.status(404).json({ message: 'Not found' });
  res.json(updated);
});

// delete (admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  await Workflow.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

module.exports = router;