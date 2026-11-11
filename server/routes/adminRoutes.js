const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(authenticateToken);
router.use(authorizeRoles('admin'));

router.get('/dashboard', adminController.getDashboardStats);
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/status', adminController.toggleUserStatus);
router.get('/products', adminController.getAllProducts);
router.delete('/products/:id', adminController.deleteProduct);
router.get('/orders', adminController.getAllOrders);

module.exports = router;

