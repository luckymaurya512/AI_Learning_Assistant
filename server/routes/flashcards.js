const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Flashcard = require('../models/Flashcard');
const Document = require('../models/Document');

// @desc    Get all user flashcards (with optional filtering by document and favorites)
// @route   GET /api/flashcards
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { documentId, favorite } = req.query;
    const query = { user: req.user._id };

    if (documentId) {
      query.document = documentId;
    }
    if (favorite === 'true') {
      query.isFavorite = true;
    }

    const flashcards = await Flashcard.find(query).sort({ createdAt: -1 }).populate('document', 'title');
    res.json({
      success: true,
      count: flashcards.length,
      data: flashcards
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create a new manual flashcard
// @route   POST /api/flashcards
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { question, answer, documentId } = req.body;

    if (!question || !answer || !documentId) {
      return res.status(400).json({ success: false, message: 'Please provide question, answer, and document ID' });
    }

    // Verify document exists and belongs to user
    const doc = await Document.findOne({ _id: documentId, user: req.user._id });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Associated study document not found' });
    }

    const card = await Flashcard.create({
      question,
      answer,
      document: documentId,
      user: req.user._id
    });

    res.status(201).json({
      success: true,
      data: card
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Toggle flashcard favorite status
// @route   PUT /api/flashcards/:id/favorite
// @access  Private
router.put('/:id/favorite', protect, async (req, res) => {
  try {
    let card = await Flashcard.findOne({ _id: req.params.id, user: req.user._id });
    if (!card) {
      return res.status(404).json({ success: false, message: 'Flashcard not found' });
    }

    card.isFavorite = !card.isFavorite;
    await card.save();

    res.json({
      success: true,
      data: card
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete a flashcard
// @route   DELETE /api/flashcards/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const card = await Flashcard.findOne({ _id: req.params.id, user: req.user._id });
    if (!card) {
      return res.status(404).json({ success: false, message: 'Flashcard not found' });
    }

    await Flashcard.deleteOne({ _id: req.params.id });

    res.json({
      success: true,
      message: 'Flashcard deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
