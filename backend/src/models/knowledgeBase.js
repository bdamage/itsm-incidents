const mongoose = require('mongoose');

const KnowledgeBaseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    description: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('KnowledgeBase', KnowledgeBaseSchema);