// Carbon emission factors (kg CO2 per unit)
const EMISSION_FACTORS = {
  transport: {
    car: 0.21,      // kg CO2 per km
    bus: 0.09,      // kg CO2 per km
    bike: 0,        // 0 emissions
    walk: 0         // 0 emissions
  },
  electricity: 0.48, // kg CO2 per kWh (Kenya average)
  food: {
    meat: 7.2,      // kg CO2 per meal
    vegetarian: 3.5,
    vegan: 2.1
  }
};

const calculateCarbonScore = (data) => {
  const { transportType, distanceKm, electricityKwh, foodType } = data;

  let transportEmissions = 0;
  let electricityEmissions = 0;
  let foodEmissions = 0;

  // Calculate transport emissions
  if (transportType && distanceKm > 0) {
    const factor = EMISSION_FACTORS.transport[transportType] || 0;
    transportEmissions = factor * distanceKm;
  }

  // Calculate electricity emissions
  if (electricityKwh > 0) {
    electricityEmissions = EMISSION_FACTORS.electricity * electricityKwh;
  }

  // Calculate food emissions
  if (foodType) {
    foodEmissions = EMISSION_FACTORS.food[foodType] || 0;
  }

  const totalScore = transportEmissions + electricityEmissions + foodEmissions;

  return {
    score: Number(totalScore.toFixed(1)),
    breakdown: {
      transport: Number(transportEmissions.toFixed(1)),
      electricity: Number(electricityEmissions.toFixed(1)),
      food: Number(foodEmissions.toFixed(1))
    }
  };
};

module.exports = { calculateCarbonScore };
