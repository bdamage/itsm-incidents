const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    role: { type: String, enum: ['end_user', 'agent', 'admin','knowledge_manager'], default: 'end_user' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);