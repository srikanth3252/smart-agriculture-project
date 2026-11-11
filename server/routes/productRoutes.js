const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public endpoints
router.get('/', productController.getProducts);

// Farmer-specific products
router.get(
  '/farmer/my-products',
  authenticateToken,
  authorizeRoles('farmer'),
  productController.getFarmerProducts
);

// Single product details
router.get('/:id', productController.getProductById);

// Create product (farmer only)
router.post(
  '/',
  authenticateToken,
  authorizeRoles('farmer'),
  upload.single('image'),
  productController.createProduct
);

// Update product (farmer or admin)
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('farmer', 'admin'),
  upload.single('image'),
  productController.updateProduct
);

// Delete product (farmer or admin)
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('farmer', 'admin'),
  productController.deleteProduct
);

module.exports = router;

