const mongoose = require('mongoose');

const CatalogItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, index: true },
    shortDescription: { type: String, required: true },
    description: { type: String },
    category: { type: String, index: true },
    catalog: { type: mongoose.Schema.Types.ObjectId, ref: 'Catalog', required: true },
    knowledgeArticle: { type: mongoose.Schema.Types.ObjectId, ref: 'KnowledgeArticle' }, // optional link
    available: { type: Boolean, default: true },
    price: { type: String } // optionally show cost or notes
  },
  { timestamps: true }
);

module.exports = mongoose.model('CatalogItem', CatalogItemSchema);