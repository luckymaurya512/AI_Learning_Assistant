const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { protect } = require('../middleware/auth');
const Document = require('../models/Document');
const Flashcard = require('../models/Flashcard');
const Quiz = require('../models/Quiz');
const ChatHistory = require('../models/ChatHistory');

// Validate Gemini API Key
const getGenAIModel = (systemInstruction) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API Key is missing. Please add it to your server .env file.');
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Use gemini-2.5-flash for speed and reliability in learning context
  return genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    ...(systemInstruction && { systemInstruction })
  });
};

// Helper to clean JSON string from Gemini (handles cases where markdown formatting is returned despite instructions)
const cleanJsonString = (rawText) => {
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```json\s*/i, '');
    cleaned = cleaned.replace(/^```\s*/i, '');
    cleaned = cleaned.replace(/\s*```$/i, '');
  }
  return cleaned.trim();
};

// @desc    Context-aware Chat Q&A with Gemini based on document text
// @route   POST /api/ai/chat
// @access  Private
router.post('/chat', protect, async (req, res) => {
  try {
    const { documentId, message } = req.body;

    if (!documentId || !message) {
      return res.status(400).json({ success: false, message: 'Please provide document ID and message' });
    }

    // 1. Fetch document
    const doc = await Document.findOne({ _id: documentId, user: req.user._id });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // 2. Fetch recent chat history for context (up to 10 messages)
    const history = await ChatHistory.find({ document: documentId, user: req.user._id })
      .sort({ createdAt: 1 })
      .limit(10);

    // 3. Define System Prompt for context injection
    const systemInstruction = `You are "StudyBuddy", a helpful AI study assistant. Below is the text content of the study document titled "${doc.title}":

--- DOCUMENT CONTENT START ---
${doc.textContext}
--- DOCUMENT CONTENT END ---

Use this document content as your primary source of truth to answer the user's questions. 
If the answer can be found in the document, explain it thoroughly using details from the text.
If the answer is NOT in the document, answer it using your general knowledge but clearly state: "Note: This information is not explicitly mentioned in the document, but here is the answer from general knowledge:".
Keep your answers educational, engaging, structured, and format them beautifully using markdown (bold text, bullet points, headers, code blocks).`;

    // 4. Initialize Gemini Generative Model with system instructions
    const model = getGenAIModel(systemInstruction);

    // 5. Structure Chat History for Gemini API (must have alternating user/model roles)
    const geminiHistory = history.map(h => ({
      role: h.sender === 'user' ? 'user' : 'model',
      parts: [{ text: h.message }]
    }));

    // 6. Start chat session
    const chat = model.startChat({
      history: geminiHistory
    });

    // 7. Send message to AI
    const result = await chat.sendMessage(message);
    const aiResponse = result.response.text();

    // 8. Save chat records to database
    await ChatHistory.create({
      document: documentId,
      user: req.user._id,
      sender: 'user',
      message: message
    });

    const aiMessage = await ChatHistory.create({
      document: documentId,
      user: req.user._id,
      sender: 'ai',
      message: aiResponse
    });

    res.json({
      success: true,
      data: aiMessage
    });

  } catch (error) {
    console.error('Gemini Chat Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get chat history for a document
// @route   GET /api/ai/chat/:documentId
// @access  Private
router.get('/chat/:documentId', protect, async (req, res) => {
  try {
    const history = await ChatHistory.find({
      document: req.params.documentId,
      user: req.user._id
    }).sort({ createdAt: 1 });

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Clear chat history for a document
// @route   DELETE /api/ai/chat/:documentId
// @access  Private
router.delete('/chat/:documentId', protect, async (req, res) => {
  try {
    await ChatHistory.deleteMany({
      document: req.params.documentId,
      user: req.user._id
    });

    res.json({
      success: true,
      message: 'Chat history cleared successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    One-click summary generation
// @route   POST /api/ai/summary
// @access  Private
router.post('/summary', protect, async (req, res) => {
  try {
    const { documentId } = req.body;
    if (!documentId) {
      return res.status(400).json({ success: false, message: 'Please provide document ID' });
    }

    const doc = await Document.findOne({ _id: documentId, user: req.user._id });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const prompt = `Provide a comprehensive, well-structured study summary of the document below. 
Include:
1. A high-level overview.
2. 5-7 key take-aways and important points.
3. List of core terms/definitions if available.
Use Markdown headers, bold terms, and bullet points.

Document title: ${doc.title}
Document Content:
${doc.textContext}`;

    const model = getGenAIModel();
    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    res.json({
      success: true,
      summary: summary
    });
  } catch (error) {
    console.error('Gemini Summary Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Concept Explainer
// @route   POST /api/ai/explain
// @access  Private
router.post('/explain', protect, async (req, res) => {
  try {
    const { documentId, concept } = req.body;
    if (!documentId || !concept) {
      return res.status(400).json({ success: false, message: 'Please provide document ID and concept to explain' });
    }

    const doc = await Document.findOne({ _id: documentId, user: req.user._id });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const prompt = `Based on the document context provided, explain the concept: "${concept}".
Requirements:
1. Explain it in simple terms, suitable for a student studying this material.
2. Give a real-world analogy or example to illustrate it.
3. Provide 2-3 key takeaways about this concept.
If the concept is not mentioned in the document, explain it using general knowledge, but prepend a note stating that it was not found in the document.

Document Context:
${doc.textContext}`;

    const model = getGenAIModel();
    const result = await model.generateContent(prompt);
    const explanation = result.response.text();

    res.json({
      success: true,
      explanation: explanation
    });
  } catch (error) {
    console.error('Gemini Explain Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Auto-generate study flashcards
// @route   POST /api/ai/generate-flashcards
// @access  Private
router.post('/generate-flashcards', protect, async (req, res) => {
  try {
    const { documentId, count = 5 } = req.body;

    const doc = await Document.findOne({ _id: documentId, user: req.user._id });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const prompt = `You are a study materials generator. Create exactly ${count} study flashcards from the document below.
Each flashcard consists of a study question and a clear, concise answer.
You MUST respond ONLY with a raw JSON array of objects. Do not include markdown code block ticks (\`\`\`json or \`\`\`), do not include introductory or ending text.
The JSON array must have this structure:
[
  {
    "question": "What is the capital of France?",
    "answer": "Paris"
  }
]

Document content:
${doc.textContext}`;

    const model = getGenAIModel();
    
    // Request JSON mime type to ensure structured output
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const rawText = result.response.text();
    const cleanedJson = cleanJsonString(rawText);
    const flashcardsArray = JSON.parse(cleanedJson);

    if (!Array.isArray(flashcardsArray)) {
      throw new Error('AI output is not a valid flashcards array');
    }

    // Insert generated flashcards into database
    const createdCards = [];
    for (const card of flashcardsArray) {
      const dbCard = await Flashcard.create({
        question: card.question,
        answer: card.answer,
        document: documentId,
        user: req.user._id
      });
      createdCards.push(dbCard);
    }

    res.status(201).json({
      success: true,
      count: createdCards.length,
      data: createdCards
    });

  } catch (error) {
    console.error('Gemini Flashcards Generation Error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate flashcards: ' + error.message });
  }
});

// @desc    Auto-generate multiple-choice quiz
// @route   POST /api/ai/generate-quiz
// @access  Private
router.post('/generate-quiz', protect, async (req, res) => {
  try {
    const { documentId, questionCount = 5 } = req.body;

    const doc = await Document.findOne({ _id: documentId, user: req.user._id });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const prompt = `You are an expert educator. Generate a multiple-choice quiz with exactly ${questionCount} questions based on the document text below.
Requirements for each question:
- A clear, challenging question text.
- Exactly 4 options.
- A 0-based index indicating the correct option (0, 1, 2, or 3).
- A detailed explanation of why it is correct.

You MUST respond ONLY with a raw JSON array of objects. Do not include markdown code block ticks (\`\`\`json or \`\`\`), do not include introductory or ending text.
The JSON array must have this structure:
[
  {
    "questionText": "Which gas do plants absorb for photosynthesis?",
    "options": ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
    "correctOptionIndex": 1,
    "explanation": "Carbon dioxide is absorbed by plants through stomata and is used as a carbon source in the Calvin cycle to produce sugars."
  }
]

Document content:
${doc.textContext}`;

    const model = getGenAIModel();
    
    // Request JSON mime type
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const rawText = result.response.text();
    const cleanedJson = cleanJsonString(rawText);
    const quizQuestions = JSON.parse(cleanedJson);

    if (!Array.isArray(quizQuestions)) {
      throw new Error('AI output is not a valid quiz questions array');
    }

    // Save generated Quiz
    const quiz = await Quiz.create({
      title: `AI Quiz on: ${doc.title}`,
      document: documentId,
      user: req.user._id,
      questions: quizQuestions
    });

    res.status(201).json({
      success: true,
      data: quiz
    });

  } catch (error) {
    console.error('Gemini Quiz Generation Error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate quiz: ' + error.message });
  }
});

module.exports = router;
