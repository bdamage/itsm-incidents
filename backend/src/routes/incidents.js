const express = require('express');
const router = express.Router();
const { Incident, PRIORITIES, STATES } = require('../models/incident');


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



// Create ticket (ITIL-aligned incident/request)
router.post('/', async (req, res) => {
  const {
    shortDescription,
    description,
    caller,
    ticketType, // optional: 'incident'|'request'
    impact,
    urgency,
    category,
    subcategory,
    configurationItem
  } = req.body;

  if (!shortDescription || !shortDescription.trim()) {
    return res.status(400).json({ message: 'shortDescription is required' });
  }
  if (!caller) {
    return res.status(400).json({ message: 'caller is required' });
  }

  // sanitize ticketType
  const type = ticketType === 'request' ? 'request' : 'incident';

  // default impact/urgency to medium (3) if not provided
  const imp = Number(impact) || 3;
  const urg = Number(urgency) || 3;

  // compute priority using model static (ITIL matrix)
  const priority = Incident.computePriority(imp, urg);

  const payload = {
    ticketType: type,
    shortDescription: shortDescription.trim(),
    description: description || '',
    caller,
    openedBy: caller, // for end-user portal openedBy is caller; agents may override
    impact: imp,
    urgency: urg,
    priority,
    category,
    subcategory,
    configurationItem
  };

  const created = await Incident.create(payload);
  const populated = await Incident.findById(created._id).populate('assignmentGroup assignedTo caller openedBy');
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