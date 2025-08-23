const express = require('express');
const { Incident, PRIORITIES, STATES } = require('../models/incident');

const router = express.Router();

// List incidents with search, state, priority, pagination
router.get('/', async (req, res) => {
  const { q, state, priority, page = 1, limit = 20 } = req.query;

  const clean = (v) => {
    if (v === undefined || v === null) return undefined;
    const s = String(v).trim();
    if (!s || s === 'undefined' || s === 'null') return undefined;
    return s;
  };

  const search = clean(q);
  const st = clean(state);
  const pr = clean(priority);

  const filter = {};

  if (search) {
    const re = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [
      { shortDescription: re },
      { description: re }
    ];
  }

  if (st) filter.state = st;
  if (pr) filter.priority = pr;

  const skip = (Math.max(Number(page), 1) - 1) * Number(limit);

  const [items, total] = await Promise.all([
    Incident.find(filter)
      .populate('assignmentGroup assignedTo caller')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Incident.countDocuments(filter)
  ]);

  res.json({ items, total, page: Number(page), limit: Number(limit),     meta: { PRIORITIES, STATES } });
});
/* // List incidents with filters & pagination
router.get('/', async (req, res) => {
  const {
    page = 1,
    limit = 20,
    state,
    priority,
    assignmentGroup,
    assignedTo,
    caller,
    q
  } = req.query;

  const query = {};
  if (state) query.state = state;
  if (priority) query.priority = priority;
  if (assignmentGroup) query.assignmentGroup = assignmentGroup;
  if (assignedTo) query.assignedTo = assignedTo;
  if (caller) query.caller = caller;
  if (q) query.$or = [
    { shortDescription: new RegExp(q, 'i') },
    { description: new RegExp(q, 'i') },
    { number: new RegExp(q, 'i') }
  ];

  const skip = (Number(page) - 1) * Number(limit);

  const [items, total] = await Promise.all([
    Incident.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('assignmentGroup assignedTo caller'),
       Incident.countDocuments(query)
  ]);

  res.json({
    items,
    total,
    page: Number(page),
    limit: Number(limit),
    meta: { PRIORITIES, STATES }
  });
}); */

// Create incident
router.post('/', async (req, res) => {
  const { shortDescription, description, priority, state, assignmentGroup, assignedTo, caller } = req.body;
  if (!shortDescription) return res.status(400).json({ error: 'shortDescription is required' });
  if (!caller) return res.status(400).json({ error: 'caller is required' });
  if (priority && !PRIORITIES.includes(priority)) return res.status(400).json({ error: 'invalid priority' });
  if (state && !STATES.includes(state)) return res.status(400).json({ error: 'invalid state' });

  const incident = await Incident.create({ shortDescription, description, priority, state, assignmentGroup, assignedTo, caller });
  const populated = await incident.populate('assignmentGroup assignedTo caller');
  res.status(201).json(populated);
});

// Read
router.get('/:id', async (req, res) => {
  const incident = await Incident.findById(req.params.id).populate('assignmentGroup assignedTo caller');
  if (!incident) return res.status(404).json({ error: 'Incident not found' });
  res.json(incident);
});

// Update (partial)
router.patch('/:id', async (req, res) => {
  const allowed = ['shortDescription', 'description', 'priority', 'state', 'assignmentGroup', 'assignedTo', 'caller'];
  const update = {};
  for (const key of allowed) if (key in req.body) update[key] = req.body[key];

  if (update.priority && !PRIORITIES.includes(update.priority)) return res.status(400).json({ error: 'invalid priority' });
  if (update.state && !STATES.includes(update.state)) return res.status(400).json({ error: 'invalid state' });

  const incident = await Incident.findByIdAndUpdate(req.params.id, update, { new: true }).populate('assignmentGroup assignedTo caller');
  if (!incident) return res.status(404).json({ error: 'Incident not found' });
  res.json(incident);
});

// Update state specifically
router.patch('/:id/state', async (req, res) => {
  const { state } = req.body;
  if (!STATES.includes(state)) return res.status(400).json({ error: 'invalid state' });
  const incident = await Incident.findByIdAndUpdate(req.params.id, { state }, { new: true }).populate('assignmentGroup assignedTo caller');
  if (!incident) return res.status(404).json({ error: 'Incident not found' });
  res.json(incident);
});

module.exports = router;