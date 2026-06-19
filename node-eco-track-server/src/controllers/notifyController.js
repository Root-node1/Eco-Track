const { getIO } = require('../config/socket');

const sendToast = (req, res) => {
  const { message, type = 'info' } = req.body;
  if (!message) return res.status(400).json({ success: false, message: 'Message required' });

  getIO().emit('toast', { message, type, timestamp: new Date().toISOString() });

  res.status(200).json({ success: true, message: 'Toast sent' });
};

module.exports = { sendToast };