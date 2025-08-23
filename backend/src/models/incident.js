const mongoose = require('mongoose');
const { customAlphabet } = require('nanoid');

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 6);

// ITIL-aligned enums and fields
const PRIORITIES = ['P1', 'P2', 'P3', 'P4'];
const STATES = [
  'New',
  'Assigned',
  'In Progress',
  'Awaiting User',
  'Awaiting Vendor',
  'Resolved',
  'Closed',
  'Cancelled',
  'Reopened'
];

const IncidentSchema = new mongoose.Schema(
  {
    ticketType: { type: String, enum: ['incident', 'request'], default: 'incident', index: true },

    // e.g., INC-ABC123 or REQ-ABC123
    number: { type: String, unique: true, index: true },

    // core descriptions
    shortDescription: { type: String, required: true },
    description: { type: String },

    // ITIL classification / CI
    category: { type: String, index: true },
    subcategory: { type: String, index: true },
    configurationItem: { type: String }, // free-text or CI reference

    // ITIL impact / urgency (1 = highest, 5 = lowest)
    impact: { type: Number, min: 1, max: 5, default: 3, index: true },
    urgency: { type: Number, min: 1, max: 5, default: 3, index: true },

    // derived priority (P1..P4) using an impact/urgency matrix
    priority: { type: String, enum: PRIORITIES, default: 'P3', index: true },

    // ITIL states
    state: { type: String, enum: STATES, default: 'New', index: true },

    assignmentGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // caller (reported by) and openedBy (agent/system who opened)
    caller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    openedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // resolution information
    resolution: { type: String },
    resolutionNotes: { type: String },
    resolutionCode: { type: String },
    resolvedAt: { type: Date },
    closedAt: { type: Date },

    // SLA / tracking
    slaBreached: { type: Boolean, default: false },
    reopenedCount: { type: Number, default: 0 },

    // work notes and audit
    workNotes: [
      {
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        note: String,
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

/**
 * Compute priority from impact + urgency using a simple ITIL-style matrix:
 * - treat impact/urgency as 1 (highest) ... 5 (lowest)
 * - sum <= 2 => P1
 * - sum == 3 => P2
 * - sum <= 5 => P3
 * - sum > 5 => P4
 */
IncidentSchema.statics.computePriority = function computePriority(impact = 3, urgency = 3) {
  const i = Number(impact) || 3;
  const u = Number(urgency) || 3;
  const sum = i + u;
  if (sum <= 2) return 'P1';
  if (sum === 3) return 'P2';
  if (sum <= 5) return 'P3';
  return 'P4';
};

// Ensure a unique number is set before saving (with limited retries to avoid collisions)
// Also derive priority on create if not provided and set resolved/closed timestamps when state dictates.
IncidentSchema.pre('save', async function (next) {
  try {
    // ensure priority derived from impact/urgency if not explicitly set
    if (!this.priority) {
      this.priority = this.constructor.computePriority(this.impact, this.urgency);
    }

    // if state implies resolved/closed timestamps, set them if not present
    if (this.isModified('state')) {
      if (this.state === 'Resolved' && !this.resolvedAt) this.resolvedAt = new Date();
      if (this.state === 'Closed' && !this.closedAt) this.closedAt = new Date();
      if (this.state === 'Reopened') this.reopenedCount = (this.reopenedCount || 0) + 1;
    }

    // generate unique ticket number if not set
    if (this.number) return next();

    const prefix = this.ticketType === 'request' ? 'REQ' : 'INC';
    const maxAttempts = 8;
    for (let i = 0; i < maxAttempts; i++) {
      const candidate = `${prefix}-${nanoid()}`;
      // use model-level exists check to avoid race at generation time
      const exists = await this.constructor.exists({ number: candidate });
      if (!exists) {
        this.number = candidate;
        return next();
      }
    }

    return next(new Error('Failed to generate a unique ticket number after multiple attempts'));
  } catch (err) {
    return next(err);
  }
});

module.exports = {
  Incident: mongoose.model('Incident', IncidentSchema),
  PRIORITIES,
  STATES
};