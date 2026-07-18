const mongoose = require('mongoose');

const FlashcardSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Please add a question'],
    trim: true
  },
  answer: {
    type: String,
    required: [true, 'Please add an answer'],
    trim: true
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Flashcard', FlashcardSchema);
