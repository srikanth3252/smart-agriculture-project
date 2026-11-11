const express = require('express');
const router = express.Router();
const priceController = require('../controllers/priceController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Public read
router.get('/', priceController.getPrices);

// Admin-only updates
router.post('/', authenticateToken, authorizeRoles('admin'), priceController.addPrice);
router.put('/:id', authenticateToken, authorizeRoles('admin'), priceController.updatePrice);

module.exports = router;

