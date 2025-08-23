const mongoose = require('mongoose');
const { customAlphabet } = require('nanoid');

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 6);

const PRIORITIES = ['P1', 'P2', 'P3', 'P4'];
const STATES = ['New', 'In Progress', 'On Hold', 'Resolved', 'Closed', 'Canceled'];

const IncidentSchema = new mongoose.Schema(
  {
    number: { type: String, unique: true, index: true }, // e.g., INC-ABC123
    shortDescription: { type: String, required: true },
    description: { type: String },

    priority: { type: String, enum: PRIORITIES, default: 'P3', index: true },
    state: { type: String, enum: STATES, default: 'New', index: true },

    assignmentGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    caller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);


// Ensure a unique number is set before saving (with limited retries to avoid collisions)
IncidentSchema.pre('save', async function (next) {
  try {
    if (this.number) return next();

    const maxAttempts = 5;
    for (let i = 0; i < maxAttempts; i++) {
      const candidate = `INC-${nanoid()}`;
      console.log(`Generated candidate number: ${candidate}`);

      // use this.constructor to query the model safely inside middleware
      const exists = await this.constructor.exists({ number: candidate });
      if (!exists) {
        this.number = candidate;
        return next();
      }
    }

    return next(new Error('Failed to generate a unique incident number after multiple attempts'));
  } catch (err) {
    return next(err);
  }
});

module.exports = {
  Incident: mongoose.model('Incident', IncidentSchema),
  PRIORITIES,
  STATES
};