const mongoose = require('mongoose');

const QuizQuestionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true,
    validate: [arrayLimit, 'A question must have exactly 4 options']
  },
  correctOptionIndex: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  },
  explanation: {
    type: String,
    required: true
  }
});

function arrayLimit(val) {
  return val.length === 4;
}

const QuizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a quiz title'],
    trim: true
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
  questions: [QuizQuestionSchema],
  score: {
    type: Number,
    default: null
  },
  userAnswers: {
    type: [Number],
    default: []
  },
  takenAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Quiz', QuizSchema);
