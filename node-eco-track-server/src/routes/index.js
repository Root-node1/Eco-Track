const express = require('express');
const { logActivity, getStats, getClimate } = require('../controllers/activityController');
const { sendMessage, getChatHistory } = require('../controllers/chatbotController');

const router = express.Router();

// EcoTrack API Routes
router.post('/log', logActivity);
router.get('/stats', getStats);
router.get('/climate', getClimate);

// Chatbot Routes
router.post('/chatbot/message', sendMessage);
router.get('/chatbot/history/:userId', getChatHistory);

module.exports = router;
