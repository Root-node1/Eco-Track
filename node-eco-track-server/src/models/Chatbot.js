const mongoose = require('mongoose');

const ChatbotSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    default: 'anonymous'
  },
  userMessage: {
    type: String,
    required: true
  },
  botResponse: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Chatbot', ChatbotSchema);
