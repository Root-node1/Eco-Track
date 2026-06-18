const express = require('express');
const router = express.Router();
const { sendToast } = require('../controllers/notifyController');

router.post('/notify', sendToast);

module.exports = router;