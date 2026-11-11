// POST /api/suggest
function getCropSuggestions(req, res) {
  const { soil, season, irrigation } = req.body;

  let crops = [];
  const details = [];

  const soilType = (soil || '').toLowerCase().trim();
  const seasonType = (season || '').toLowerCase().trim();

  // Soil-based rules (preserved from previous implementation)
  if (soilType === 'black') {
    crops.push('Cotton', 'Sugarcane');
    details.push({
      crop: 'Cotton',
      suitability: 'High',
      soilMatch: 'Black soil provides high moisture retention ideal for deep root penetration.',
      waterRequirement: 'Medium',
      duration: '150 - 180 days'
    });
    details.push({
      crop: 'Sugarcane',
      suitability: 'High',
      soilMatch: 'Rich in lime, iron and magnesium which enhances sucrose production.',
      waterRequirement: 'High',
      duration: '300 - 365 days'
    });
  } else if (soilType === 'red') {
    crops.push('Groundnut', 'Millets');
    details.push({
      crop: 'Groundnut',
      suitability: 'High',
      soilMatch: 'Well-drained red loamy soil allows easy peg penetration and pod formation.',
      waterRequirement: 'Low to Medium',
      duration: '100 - 120 days'
    });
    details.push({
      crop: 'Millets',
      suitability: 'Very High',
      soilMatch: 'Extremely drought resistant and flourishes in mineral-rich red soil.',
      waterRequirement: 'Low',
      duration: '75 - 90 days'
    });
  } else if (soilType === 'sandy') {
    crops.push('Watermelon', 'Peanuts');
    details.push({
      crop: 'Watermelon',
      suitability: 'High',
      soilMatch: 'Warm sandy soil warms rapidly and ensures excellent drainage for root expansion.',
      waterRequirement: 'Moderate',
      duration: '80 - 100 days'
    });
    details.push({
      crop: 'Peanuts',
      suitability: 'Medium',
      soilMatch: 'Light sandy texture permits effortless harvest without pod breakage.',
      waterRequirement: 'Low',
      duration: '110 - 130 days'
    });
  } else if (soilType === 'clay' || soilType === 'alluvial') {
    crops.push('Rice', 'Wheat');
    details.push({
      crop: 'Rice',
      suitability: 'Very High',
      soilMatch: 'Alluvial soil retains standing water and nutrients essential for paddy crops.',
      waterRequirement: 'Very High',
      duration: '120 - 150 days'
    });
    details.push({
      crop: 'Wheat',
      suitability: 'High',
      soilMatch: 'Fine-textured loam ensures high tillering and grain filling.',
      waterRequirement: 'Medium',
      duration: '110 - 130 days'
    });
  }

  // Season-based additions (preserved from previous implementation)
  if (seasonType === 'summer') {
    if (!crops.includes('Maize')) {
      crops.push('Maize');
      details.push({
        crop: 'Maize',
        suitability: 'Good',
        soilMatch: 'Requires plenty of sunshine and warm temperatures during early growth.',
        waterRequirement: 'Medium',
        duration: '90 - 110 days'
      });
    }
  } else if (seasonType === 'rainy' || seasonType === 'kharif') {
    if (!crops.includes('Rice')) {
      crops.push('Rice');
      details.push({
        crop: 'Rice',
        suitability: 'High',
        soilMatch: 'Monsoon rainfall fulfills high irrigation demands naturally.',
        waterRequirement: 'High',
        duration: '120 - 150 days'
      });
    }
    if (!crops.includes('Soybean')) {
      crops.push('Soybean');
      details.push({
        crop: 'Soybean',
        suitability: 'High',
        soilMatch: 'Ideal kharif crop fixing atmospheric nitrogen during rainy months.',
        waterRequirement: 'Medium',
        duration: '90 - 105 days'
      });
    }
  } else if (seasonType === 'winter' || seasonType === 'rabi') {
    if (!crops.includes('Wheat')) {
      crops.push('Wheat');
      details.push({
        crop: 'Wheat',
        suitability: 'Very High',
        soilMatch: 'Cool temperatures during vegetative phase promote strong grain density.',
        waterRequirement: 'Medium',
        duration: '115 - 135 days'
      });
    }
    if (!crops.includes('Mustard')) {
      crops.push('Mustard');
      details.push({
        crop: 'Mustard',
        suitability: 'High',
        soilMatch: 'Dry, crisp winter air supports high oil percentage in seeds.',
        waterRequirement: 'Low',
        duration: '85 - 110 days'
      });
    }
  }

  // If nothing matched, provide general recommendations
  if (crops.length === 0) {
    crops = ['Rice', 'Wheat', 'Maize', 'Vegetables'];
    details.push({
      crop: 'General Vegetables',
      suitability: 'Adaptive',
      soilMatch: 'Short cycle leafy greens and tomatoes adapt well across varied conditions.',
      waterRequirement: 'Medium',
      duration: '60 - 90 days'
    });
  }

  // De-duplicate crops
  const uniqueCrops = [...new Set(crops)];

  res.json({
    success: true,
    crops: uniqueCrops, // Backward compatibility with previous frontend
    details,
    parameters: { soil: soilType, season: seasonType, irrigation: irrigation || 'Standard' }
  });
}

module.exports = {
  getCropSuggestions
};

