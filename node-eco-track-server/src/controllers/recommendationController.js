const Activity = require('../models/Activity');

// GET /api/recommendations/:userId
const getRecommendations = async (req, res) => {
  try {
    const { userId } = req.params;

    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(10);

    if (activities.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          recommendations: [
            'Start tracking your daily activities to get personalized recommendations!',
            'Consider using public transport instead of private cars.',
            'Try reducing meat consumption for lower food emissions.'
          ]
        }
      });
    }

    // Calculate averages
    const avgTransport = activities.reduce((sum, a) => sum + a.breakdown.transport, 0) / activities.length;
    const avgElectricity = activities.reduce((sum, a) => sum + a.breakdown.electricity, 0) / activities.length;
    const avgFood = activities.reduce((sum, a) => sum + a.breakdown.food, 0) / activities.length;

    const recommendations = [];

    if (avgTransport > 5) {
      recommendations.push('🚌 Consider using public transport or carpooling to reduce transport emissions.');
    } else if (avgTransport > 3) {
      recommendations.push('🚲 Try walking or cycling for short distances to reduce your carbon footprint.');
    }

    if (avgElectricity > 3) {
      recommendations.push('💡 Switch to energy-efficient appliances and LED bulbs to reduce electricity emissions.');
    } else if (avgElectricity > 1) {
      recommendations.push('🔌 Unplug devices when not in use to save energy.');
    }

    if (avgFood > 4) {
      recommendations.push('🥗 Try incorporating more plant-based meals into your diet.');
    } else if (avgFood > 2) {
      recommendations.push('🌱 Consider reducing meat consumption by one meal per day.');
    }

    if (recommendations.length === 0) {
      recommendations.push('🌟 You\'re doing great! Keep maintaining your sustainable habits!');
    }

    res.status(200).json({
      success: true,
      data: {
        recommendations,
        summary: {
          avgTransport: avgTransport.toFixed(1),
          avgElectricity: avgElectricity.toFixed(1),
          avgFood: avgFood.toFixed(1)
        }
      }
    });

  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get recommendations'
    });
  }
};

module.exports = {
  getRecommendations
};
