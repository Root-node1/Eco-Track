const express = require('express');
const { logActivity, getStats, getClimate } = require('../controllers/activityController');
const { sendMessage, getChatHistory } = require('../controllers/chatbotController');
const { getRecommendations } = require('../controllers/recommendationController');
const auth = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'EcoTrack server running' });
});

// EcoTrack API Routes
router.post('/log', auth, logActivity);
router.get('/stats', auth, getStats);
router.get('/climate', getClimate);

// Chatbot Routes
router.post('/chatbot/message', sendMessage);
router.get('/chatbot/history/:userId', getChatHistory);

// Recommendations
router.get('/recommendations/:userId', auth, getRecommendations);

module.exports = router;
