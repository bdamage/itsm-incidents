const mongoose = require('mongoose');

const KnowledgeArticleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, index: true },
    shortDescription: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, index: true },
    knowledgeBase: { type: mongoose.Schema.Types.ObjectId, ref: 'KnowledgeBase', required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    validFrom: { type: Date, default: Date.now },
    validTo: { type: Date },
    published: { type: Boolean, default: true },
    tags: [{ type: String, index: true }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('KnowledgeArticle', KnowledgeArticleSchema);