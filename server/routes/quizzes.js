const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Quiz = require('../models/Quiz');
const Document = require('../models/Document');

// @desc    Get all user quizzes (with optional filtering by document)
// @route   GET /api/quizzes
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { documentId } = req.query;
    const query = { user: req.user._id };

    if (documentId) {
      query.document = documentId;
    }

    const quizzes = await Quiz.find(query).sort({ createdAt: -1 }).populate('document', 'title');
    res.json({
      success: true,
      count: quizzes.length,
      data: quizzes
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get single quiz details
// @route   GET /api/quizzes/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, user: req.user._id }).populate('document', 'title');
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }
    res.json({
      success: true,
      data: quiz
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Submit quiz answers and score the quiz
// @route   POST /api/quizzes/:id/submit
// @access  Private
router.post('/:id/submit', protect, async (req, res) => {
  try {
    const { answers } = req.body; // Array of selected option indices (0-3) in order of questions

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Please provide answers array' });
    }

    const quiz = await Quiz.findOne({ _id: req.params.id, user: req.user._id });
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    if (answers.length !== quiz.questions.length) {
      return res.status(400).json({
        success: false,
        message: `Must submit exactly ${quiz.questions.length} answers`
      });
    }

    // Calculate score
    let correctCount = 0;
    quiz.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctOptionIndex) {
        correctCount++;
      }
    });

    const scorePercentage = Math.round((correctCount / quiz.questions.length) * 100);

    // Update Quiz
    quiz.score = scorePercentage;
    quiz.userAnswers = answers;
    quiz.takenAt = new Date();
    await quiz.save();

    res.json({
      success: true,
      message: 'Quiz submitted and graded successfully',
      data: quiz
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete a quiz
// @route   DELETE /api/quizzes/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, user: req.user._id });
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    await Quiz.deleteOne({ _id: req.params.id });

    res.json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
