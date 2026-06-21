const Activity = require('../models/Activity');
const { calculateCarbonScore } = require('../utils/carbon');

// POST /api/log
const logActivity = async (req, res) => {
  try {
    const { transportType, distanceKm, electricityKwh, foodType } = req.body;

    // Validate at least one field provided
    if (!transportType && !distanceKm && !electricityKwh && !foodType) {
      return res.status(400).json({
        success: false,
        error: 'At least one activity field is required'
      });
    }

    // Calculate carbon score
    const { score, breakdown } = calculateCarbonScore({
      transportType,
      distanceKm: distanceKm || 0,
      electricityKwh: electricityKwh || 0,
      foodType
    });

    // Save to database
    const activity = new Activity({
      transportType: transportType || null,
      distanceKm: distanceKm || 0,
      electricityKwh: electricityKwh || 0,
      foodType: foodType || null,
      score,
      breakdown
    });

    await activity.save();

    res.status(201).json({
      success: true,
      data: {
        id: activity._id,
        score: activity.score,
        breakdown: activity.breakdown,
        createdAt: activity.createdAt
      }
    });

  } catch (error) {
    console.error('Error logging activity:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to log activity'
    });
  }
};

// GET /api/stats
const getStats = async (req, res) => {
  try {
    const activities = await Activity.find().sort({ createdAt: -1 });

    if (activities.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          userScore: 0,
          communityAverage: 0,
          breakdown: { transport: 0, electricity: 0, food: 0 },
          totalActivities: 0,
          period: 'last_30_days'
        }
      });
    }

    // Calculate user stats (all activities combined)
    const totalScore = activities.reduce((sum, a) => sum + a.score, 0);
    const userScore = Number((totalScore / activities.length).toFixed(1));

    // Calculate breakdown averages
    const breakdown = {
      transport: Number((activities.reduce((sum, a) => sum + a.breakdown.transport, 0) / activities.length).toFixed(1)),
      electricity: Number((activities.reduce((sum, a) => sum + a.breakdown.electricity, 0) / activities.length).toFixed(1)),
      food: Number((activities.reduce((sum, a) => sum + a.breakdown.food, 0) / activities.length).toFixed(1))
    };

    // Mock community average (in real app, this would come from all users)
    const communityAverage = Number((userScore * 1.2 + 3).toFixed(1));

    res.status(200).json({
      success: true,
      data: {
        userScore,
        communityAverage,
        breakdown,
        totalActivities: activities.length,
        period: 'last_30_days'
      }
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
};

// GET /api/climate
const getClimate = async (req, res) => {
  try {
    const { lat = -1.286389, lon = 36.817223 } = req.query;

    // Fetch from Open-Meteo API
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const weatherData = await response.json();

    // Map weather codes to conditions
    const conditionMap = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Fog',
      48: 'Depositing rime fog',
      51: 'Drizzle: Light',
      53: 'Drizzle: Moderate',
      55: 'Drizzle: Dense',
      61: 'Rain: Slight',
      63: 'Rain: Moderate',
      65: 'Rain: Heavy',
      71: 'Snow fall: Slight',
      73: 'Snow fall: Moderate',
      75: 'Snow fall: Heavy',
      80: 'Rain showers: Slight',
      81: 'Rain showers: Moderate',
      82: 'Rain showers: Violent',
      95: 'Thunderstorm: Slight',
      96: 'Thunderstorm: Moderate',
      99: 'Thunderstorm: Heavy'
    };

    const condition = conditionMap[weatherData.current_weather.weathercode] || 'Unknown';

    // Generate carbon context based on temperature
    const temp = weatherData.current_weather.temperature;
    let message = 'Normal weather conditions.';
    let seasonalFactor = 1.0;

    if (temp > 30) {
      message = 'Hot weather. Consider reducing energy usage for cooling.';
      seasonalFactor = 1.2;
    } else if (temp < 10) {
      message = 'Cold weather. Energy usage may be higher for heating.';
      seasonalFactor = 1.1;
    } else if (temp >= 18 && temp <= 25) {
      message = 'Mild weather means lower energy usage today. Good for your footprint!';
      seasonalFactor = 0.95;
    }

    res.status(200).json({
      success: true,
      data: {
        location: {
          city: 'Nairobi',
          country: 'Kenya',
          lat: parseFloat(lat),
          lon: parseFloat(lon)
        },
        weather: {
          temperature: weatherData.current_weather.temperature,
          condition: condition,
          humidity: 65,
          windSpeed: weatherData.current_weather.windspeed,
          timestamp: weatherData.current_weather.time
        },
        carbonContext: {
          message,
          seasonalFactor
        }
      }
    });

  } catch (error) {
    console.error('Error fetching climate data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch climate data'
    });
  }
};

module.exports = {
  logActivity,
  getStats,
  getClimate
};
