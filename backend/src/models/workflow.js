const mongoose = require('mongoose');

const ActionSchema = new mongoose.Schema(
  {
    type: { type: String, required: true }, // e.g. sendEmail, sendWebhook, updateRecord, createRecord, addWorkNote
    params: { type: mongoose.Schema.Types.Mixed } // arbitrary config per action
  },
  { _id: false }
);

// simple condition representation: { field, operator, value }
// operators: ==, !=, >, <, contains
const ConditionSchema = new mongoose.Schema(
  {
    field: String,
    operator: String,
    value: mongoose.Schema.Types.Mixed
  },
  { _id: false }
);

const StepSchema = new mongoose.Schema(
  {
    name: String,
    conditions: [ConditionSchema], // AND between conditions
    actions: [ActionSchema],
    stopOnMatch: { type: Boolean, default: false } // stop processing this workflow when conditions match
  },
  { _id: false }
);

const WorkflowSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    enabled: { type: Boolean, default: true },
    // target collection (e.g. 'incidents'), event: 'create' | 'update'
    trigger: {
      collection: { type: String, required: true },
      event: { type: String, enum: ['create', 'update'], required: true }
    },
    steps: [StepSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Workflow', WorkflowSchema);