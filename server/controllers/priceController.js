const PriceModel = require('../models/priceModel');

// GET /api/prices
async function getPrices(req, res, next) {
  try {
    const prices = await PriceModel.getAll();
    res.json({
      success: true,
      data: prices
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/prices (Admin only)
async function addPrice(req, res, next) {
  try {
    const { crop_name, category, unit, high_price, good_price, average_price, low_price } = req.body;

    if (!crop_name || high_price === undefined || good_price === undefined || average_price === undefined || low_price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'All price fields (high, good, average, low) and crop name are required.'
      });
    }

    const id = await PriceModel.create({
      crop_name: crop_name.trim(),
      category: category || 'General',
      unit: unit || 'quintal',
      high_price: parseFloat(high_price),
      good_price: parseFloat(good_price),
      average_price: parseFloat(average_price),
      low_price: parseFloat(low_price)
    });

    res.status(201).json({
      success: true,
      message: 'Market price benchmark recorded successfully.',
      id
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/prices/:id (Admin only)
async function updatePrice(req, res, next) {
  try {
    const { id } = req.params;
    const { high_price, good_price, average_price, low_price } = req.body;

    const updated = await PriceModel.update(id, {
      high_price: parseFloat(high_price),
      good_price: parseFloat(good_price),
      average_price: parseFloat(average_price),
      low_price: parseFloat(low_price)
    });

    res.json({
      success: true,
      message: 'Market price updated successfully.',
      price: updated
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getPrices,
  addPrice,
  updatePrice
};

