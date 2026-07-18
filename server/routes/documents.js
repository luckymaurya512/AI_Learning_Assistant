const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const { protect } = require('../middleware/auth');
const Document = require('../models/Document');
const Flashcard = require('../models/Flashcard');
const Quiz = require('../models/Quiz');
const ChatHistory = require('../models/ChatHistory');

// Set up file storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './uploads';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// File filter (Only allow PDFs)
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF documents are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// @desc    Upload & parse a PDF study document
// @route   POST /api/documents/upload
// @access  Private
router.post('/upload', protect, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF file' });
    }

    const title = req.body.title || req.file.originalname.replace('.pdf', '');
    const filepath = req.file.path.replace(/\\/g, '/'); // normalize backslashes for URL serving
    const filename = req.file.filename;
    const fileSize = req.file.size;

    // Read the PDF and parse its text contents
    const dataBuffer = fs.readFileSync(req.file.path);
    const parsedPdf = await pdfParse(dataBuffer);
    const textContext = parsedPdf.text || '';

    if (!textContext.trim()) {
      // Clean up physical file if it has no text content
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Could not extract text content from the PDF. Please check if the file is scanned or corrupted.'
      });
    }

    // Save to Database
    const doc = await Document.create({
      title,
      filename,
      filepath,
      fileSize,
      textContext,
      user: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'PDF uploaded and analyzed successfully',
      data: doc
    });
  } catch (error) {
    // Delete file if error occurs after uploading
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get all user documents
// @route   GET /api/documents
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const docs = await Document.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: docs.length,
      data: docs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get single document details
// @route   GET /api/documents/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, user: req.user._id });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }
    res.json({
      success: true,
      data: doc
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete a document
// @route   DELETE /api/documents/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, user: req.user._id });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Remove the physical file
    if (fs.existsSync(doc.filepath)) {
      fs.unlinkSync(doc.filepath);
    }

    // Delete related database items
    await Document.deleteOne({ _id: req.params.id });
    await Flashcard.deleteMany({ document: req.params.id });
    await Quiz.deleteMany({ document: req.params.id });
    await ChatHistory.deleteMany({ document: req.params.id });

    res.json({
      success: true,
      message: 'Document and all associated study tools deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get learning assistant dashboard analytics & counts
// @route   GET /api/documents/dashboard/stats
// @access  Private
router.get('/dashboard/stats', protect, async (req, res) => {
  try {
    const totalDocs = await Document.countDocuments({ user: req.user._id });
    const totalFlashcards = await Flashcard.countDocuments({ user: req.user._id });
    const totalQuizzes = await Quiz.countDocuments({ user: req.user._id });
    const favoritedCards = await Flashcard.countDocuments({ user: req.user._id, isFavorite: true });

    // Calculate quiz average score
    const quizzes = await Quiz.find({ user: req.user._id, score: { $ne: null } });
    let totalScore = 0;
    let completedQuizzesCount = quizzes.length;
    quizzes.forEach(q => {
      // score is percentage or direct number, let's keep it percentage
      totalScore += q.score;
    });
    const averageQuizScore = completedQuizzesCount > 0 ? Math.round(totalScore / completedQuizzesCount) : 0;

    // Recent activity list
    const recentDocs = await Document.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(3)
      .select('title createdAt');
    
    const recentQuizzes = await Quiz.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(3)
      .select('title score takenAt createdAt');

    const activity = [];
    
    recentDocs.forEach(d => {
      activity.push({
        type: 'document',
        message: `Uploaded document: "${d.title}"`,
        timestamp: d.createdAt
      });
    });

    recentQuizzes.forEach(q => {
      activity.push({
        type: 'quiz',
        message: q.score !== null 
          ? `Completed quiz "${q.title}" with a score of ${q.score}%` 
          : `Generated quiz "${q.title}" (not taken yet)`,
        timestamp: q.takenAt || q.createdAt
      });
    });

    // Sort activity by timestamp desc
    activity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      success: true,
      stats: {
        totalDocs,
        totalFlashcards,
        totalQuizzes,
        completedQuizzesCount,
        favoritedCards,
        averageQuizScore
      },
      recentActivity: activity.slice(0, 5) // return top 5
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
