const express = require('express');
const { logActivity, getStats, getClimate } = require('../controllers/activityController');

const router = express.Router();

// EcoTrack API Routes
router.post('/log', logActivity);
router.get('/stats', getStats);
router.get('/climate', getClimate);

module.exports = router;
