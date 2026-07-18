const mongoose = require('mongoose');

const ChatHistorySchema = new mongoose.Schema({
  document: {
    type: mongoose.Schema.ObjectId,
    ref: 'Document',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: String,
    enum: ['user', 'ai'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ChatHistory', ChatHistorySchema);
