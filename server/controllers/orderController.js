const OrderModel = require('../models/orderModel');
const CartModel = require('../models/cartModel');

// POST /api/orders
async function createOrder(req, res, next) {
  try {
    const customerId = req.user.id;
    const { deliveryAddress, deliveryPhone, paymentMethod, notes, items } = req.body;

    if (!deliveryAddress || !deliveryPhone) {
      return res.status(400).json({
        success: false,
        message: 'Delivery address and contact phone number are required.'
      });
    }

    let orderItems = items;

    // If items not directly provided in body, load from user's active cart
    if (!orderItems || orderItems.length === 0) {
      const cart = await CartModel.getCartWithItems(customerId);
      if (!cart.items || cart.items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Your shopping cart is empty.'
        });
      }
      orderItems = cart.items.map(item => ({
        productId: item.product_id,
        quantity: item.quantity
      }));
    }

    const orderResult = await OrderModel.createOrder({
      customerId,
      deliveryAddress: deliveryAddress.trim(),
      deliveryPhone: deliveryPhone.trim(),
      paymentMethod: paymentMethod || 'Cash on Delivery',
      notes: notes ? notes.trim() : '',
      items: orderItems
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! Cash on Delivery confirmed.',
      order: orderResult
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to place order.'
    });
  }
}

// GET /api/orders/my-orders
async function getMyOrders(req, res, next) {
  try {
    const customerId = req.user.id;
    const orders = await OrderModel.getCustomerOrders(customerId);

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/orders/farmer-orders
async function getFarmerOrders(req, res, next) {
  try {
    const farmerId = req.user.id;
    const orders = await OrderModel.getFarmerOrders(farmerId);

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/orders/farmer-stats
async function getFarmerStats(req, res, next) {
  try {
    const farmerId = req.user.id;
    const stats = await OrderModel.getFarmerDashboardStats(farmerId);

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/orders/:id
async function getOrderById(req, res, next) {
  try {
    const { id } = req.params;
    const order = await OrderModel.getOrderById(id, req.user.id, req.user.role);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or you are not authorized to view it.'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/orders/:id/status (for farmer updating their item or admin updating order)
async function updateOrderItemStatus(req, res, next) {
  try {
    const { id } = req.params; // orderItemId
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required.'
      });
    }

    const result = await OrderModel.updateOrderItemStatus(req.user.id, id, status);

    res.json({
      success: true,
      message: `Order item status updated to ${status}.`,
      result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

module.exports = {
  createOrder,
  getMyOrders,
  getFarmerOrders,
  getFarmerStats,
  getOrderById,
  updateOrderItemStatus
};

