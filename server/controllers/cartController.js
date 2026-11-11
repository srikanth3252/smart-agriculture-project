const CartModel = require('../models/cartModel');

// GET /api/cart
async function getCart(req, res, next) {
  try {
    const cart = await CartModel.getCartWithItems(req.user.id);
    res.json({
      success: true,
      cart
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/cart
async function addToCart(req, res, next) {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required.'
      });
    }

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than 0.'
      });
    }

    const cart = await CartModel.addItem(req.user.id, productId, qty);

    res.json({
      success: true,
      message: 'Product added to cart!',
      cart
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

// PUT /api/cart/:itemId
async function updateCartItem(req, res, next) {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const qty = parseFloat(quantity);
    if (isNaN(qty)) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required.'
      });
    }

    const cart = await CartModel.updateItem(req.user.id, itemId, qty);

    res.json({
      success: true,
      message: 'Cart updated successfully!',
      cart
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

// DELETE /api/cart/:itemId
async function removeCartItem(req, res, next) {
  try {
    const { itemId } = req.params;
    const cart = await CartModel.removeItem(req.user.id, itemId);

    res.json({
      success: true,
      message: 'Item removed from cart.',
      cart
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/cart
async function clearCart(req, res, next) {
  try {
    await CartModel.clearCart(req.user.id);
    res.json({
      success: true,
      message: 'Cart cleared.'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
};

