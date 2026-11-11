const UserModel = require('../models/userModel');
const ProductModel = require('../models/productModel');
const OrderModel = require('../models/orderModel');

// GET /api/admin/dashboard
async function getDashboardStats(req, res, next) {
  try {
    const [userStats, productStats, orderStats] = await Promise.all([
      UserModel.getStats(),
      ProductModel.getStats(),
      OrderModel.getAdminStats()
    ]);

    res.json({
      success: true,
      stats: {
        ...userStats,
        ...productStats,
        ...orderStats
      }
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/admin/users
async function getAllUsers(req, res, next) {
  try {
    const users = await UserModel.getAllUsers();
    res.json({
      success: true,
      users
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/admin/users/:id/status
async function toggleUserStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (parseInt(id, 10) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Administrators cannot deactivate their own account.'
      });
    }

    const updated = await UserModel.toggleStatus(id, isActive);

    res.json({
      success: true,
      message: `User account has been ${isActive ? 'activated' : 'deactivated'}.`,
      user: updated
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/admin/products
async function getAllProducts(req, res, next) {
  try {
    const products = await ProductModel.getAllForAdmin();
    res.json({
      success: true,
      products
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/admin/products/:id
async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    await ProductModel.delete(id, null); // Admin bypasses farmer_id check

    res.json({
      success: true,
      message: 'Product listing removed by admin.'
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/admin/orders
async function getAllOrders(req, res, next) {
  try {
    const orders = await OrderModel.getAllOrdersAdmin();
    res.json({
      success: true,
      orders
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboardStats,
  getAllUsers,
  toggleUserStatus,
  getAllProducts,
  deleteProduct,
  getAllOrders
};

