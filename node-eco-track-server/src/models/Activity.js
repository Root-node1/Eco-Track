const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  transportType: {
    type: String,
    enum: ['car', 'bus', 'bike', 'walk', null],
    default: null
  },
  distanceKm: {
    type: Number,
    min: 0,
    default: 0
  },
  electricityKwh: {
    type: Number,
    min: 0,
    default: 0
  },
  foodType: {
    type: String,
    enum: ['meat', 'vegetarian', 'vegan', null],
    default: null
  },
  score: {
    type: Number,
    default: 0
  },
  breakdown: {
    transport: { type: Number, default: 0 },
    electricity: { type: Number, default: 0 },
    food: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Activity', ActivitySchema);
