const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(authenticateToken);

// Customer checkout
router.post('/', authorizeRoles('customer'), orderController.createOrder);

// Customer order history
router.get('/my-orders', authorizeRoles('customer'), orderController.getMyOrders);

// Farmer orders management
router.get('/farmer-orders', authorizeRoles('farmer'), orderController.getFarmerOrders);
router.get('/farmer-stats', authorizeRoles('farmer'), orderController.getFarmerStats);

// Update order item status (farmer or admin)
router.put('/:id/status', authorizeRoles('farmer', 'admin'), orderController.updateOrderItemStatus);

// View specific order details
router.get('/:id', orderController.getOrderById);

module.exports = router;

