const Chatbot = require('../models/Chatbot');

// POST /api/chatbot/message
const sendMessage = async (req, res) => {
  try {
    const { message, userId } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Simple chatbot logic (can be expanded)
    const lowerMessage = message.toLowerCase();
    let response = '';

    // Keywords and responses
    const responses = {
      'carbon': 'Your carbon footprint is calculated based on your daily activities. Log your transport, electricity, and food habits to track it!',
      'transport': 'Transport emissions: Car: 0.21kg CO2/km, Bus: 0.09kg CO2/km, Bike/Walk: 0 emissions. Choose greener options!',
      'electricity': 'Electricity emissions: ~0.48kg CO2 per kWh in Kenya. Consider energy-efficient appliances to reduce your footprint!',
      'food': 'Food emissions: Meat: 7.2kg CO2/meal, Vegetarian: 3.5kg, Vegan: 2.1kg. Plant-based meals are better for the planet!',
      'hello': 'Hello! 👋 I\'m your EcoTrack assistant. Ask me about carbon footprint, transport, electricity, food, or tips to reduce emissions!',
      'hi': 'Hi there! 🌱 I\'m here to help you understand and reduce your carbon footprint. How can I help?',
      'help': 'I can help you with:\n- Carbon footprint tracking\n- Transport emissions\n- Electricity usage\n- Food choices\n- Tips to reduce emissions\nJust ask me anything!',
      'tip': 'Tips to reduce your carbon footprint:\n🌍 Use public transport or bike\n💡 Switch to LED bulbs\n🥗 Eat more plant-based meals\n♻️ Reduce, reuse, recycle\n📊 Track your progress daily!',
      'thanks': 'You\'re welcome! 🌱 Keep tracking your carbon footprint and making sustainable choices!',
      'bye': 'Goodbye! 👋 Keep being eco-friendly! Track your progress daily and make a difference!'
    };

    // Check for matches
    for (const [key, value] of Object.entries(responses)) {
      if (lowerMessage.includes(key)) {
        response = value;
        break;
      }
    }

    // Default response
    if (!response) {
      response = 'I\'m still learning! 🧠 Try asking about:\n- Carbon footprint\n- Transport emissions\n- Electricity usage\n- Food choices\n- Tips to reduce emissions';
    }

    // Save chat to database
    const chat = new Chatbot({
      userId: userId || 'anonymous',
      userMessage: message,
      botResponse: response,
      timestamp: new Date()
    });

    await chat.save();

    res.status(200).json({
      success: true,
      data: {
        userMessage: message,
        botResponse: response,
        timestamp: chat.timestamp
      }
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process message'
    });
  }
};

// GET /api/chatbot/history/:userId
const getChatHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'UserId is required'
      });
    }

    const chats = await Chatbot.find({ userId })
      .sort({ timestamp: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: chats
    });

  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chat history'
    });
  }
};

module.exports = {
  sendMessage,
  getChatHistory
};
