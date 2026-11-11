const { pool } = require('../config/db');

class CartModel {
  static async getOrCreateCart(userId) {
    const [rows] = await pool.execute(
      'SELECT id FROM carts WHERE user_id = ? LIMIT 1',
      [userId]
    );

    if (rows.length > 0) {
      return rows[0].id;
    }

    const [result] = await pool.execute(
      'INSERT INTO carts (user_id) VALUES (?)',
      [userId]
    );
    return result.insertId;
  }

  static async getCartWithItems(userId) {
    const cartId = await this.getOrCreateCart(userId);

    const [items] = await pool.execute(
      `SELECT 
        ci.id AS cart_item_id,
        ci.quantity,
        ci.created_at,
        p.id AS product_id,
        p.name AS product_name,
        p.category,
        p.price,
        p.quantity AS stock_quantity,
        p.unit,
        p.location,
        p.image_url,
        p.is_available,
        u.id AS farmer_id,
        u.name AS farmer_name
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       JOIN users u ON p.farmer_id = u.id
       WHERE ci.cart_id = ?
       ORDER BY ci.created_at DESC`,
      [cartId]
    );

    const subtotal = items.reduce((acc, item) => {
      const price = parseFloat(item.price) || 0;
      const qty = parseFloat(item.quantity) || 0;
      return acc + (price * qty);
    }, 0);

    return {
      cartId,
      items,
      subtotal: parseFloat(subtotal.toFixed(2)),
      totalItems: items.length
    };
  }

  static async addItem(userId, productId, quantity = 1) {
    const cartId = await this.getOrCreateCart(userId);

    // Verify product exists and is available
    const [prods] = await pool.execute(
      'SELECT id, quantity, is_available FROM products WHERE id = ? LIMIT 1',
      [productId]
    );

    if (prods.length === 0) {
      throw new Error('Product not found');
    }

    const product = prods[0];
    if (!product.is_available || product.quantity <= 0) {
      throw new Error('Product is currently out of stock or unavailable');
    }

    // Check if item already exists in cart
    const [existing] = await pool.execute(
      'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?',
      [cartId, productId]
    );

    if (existing.length > 0) {
      const newQty = parseFloat(existing[0].quantity) + parseFloat(quantity);
      if (newQty > product.quantity) {
        throw new Error(`Only ${product.quantity} units available in stock`);
      }
      await pool.execute(
        'UPDATE cart_items SET quantity = ? WHERE id = ?',
        [newQty, existing[0].id]
      );
    } else {
      if (quantity > product.quantity) {
        throw new Error(`Only ${product.quantity} units available in stock`);
      }
      await pool.execute(
        'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)',
        [cartId, productId, quantity]
      );
    }

    return this.getCartWithItems(userId);
  }

  static async updateItem(userId, cartItemId, quantity) {
    const cartId = await this.getOrCreateCart(userId);

    if (quantity <= 0) {
      return this.removeItem(userId, cartItemId);
    }

    // Check stock
    const [itemRows] = await pool.execute(
      `SELECT ci.id, ci.product_id, p.quantity AS stock 
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.id = ? AND ci.cart_id = ?`,
      [cartItemId, cartId]
    );

    if (itemRows.length === 0) {
      throw new Error('Cart item not found');
    }

    if (quantity > itemRows[0].stock) {
      throw new Error(`Requested quantity exceeds available stock (${itemRows[0].stock})`);
    }

    await pool.execute(
      'UPDATE cart_items SET quantity = ? WHERE id = ? AND cart_id = ?',
      [quantity, cartItemId, cartId]
    );

    return this.getCartWithItems(userId);
  }

  static async removeItem(userId, cartItemId) {
    const cartId = await this.getOrCreateCart(userId);
    await pool.execute(
      'DELETE FROM cart_items WHERE id = ? AND cart_id = ?',
      [cartItemId, cartId]
    );
    return this.getCartWithItems(userId);
  }

  static async clearCart(userId) {
    const cartId = await this.getOrCreateCart(userId);
    await pool.execute('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
  }
}

module.exports = CartModel;

