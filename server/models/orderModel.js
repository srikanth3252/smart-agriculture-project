const { pool } = require('../config/db');

class OrderModel {
  /**
   * Places an order atomically with MySQL transaction and FOR UPDATE row locks.
   */
  static async createOrder({
    customerId,
    deliveryAddress,
    deliveryPhone,
    paymentMethod = 'Cash on Delivery',
    notes = '',
    items = [] // [{ productId, quantity }]
  }) {
    if (!items || items.length === 0) {
      throw new Error('Order must contain at least one item');
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      let calculatedTotal = 0;
      const verifiedItems = [];

      // 1. Verify availability and stock atomically using FOR UPDATE
      for (const item of items) {
        const reqQty = parseFloat(item.quantity);
        if (isNaN(reqQty) || reqQty <= 0) {
          throw new Error(`Invalid quantity for product ID ${item.productId}`);
        }

        const [rows] = await connection.query(
          `SELECT id, name, price, quantity, unit, farmer_id, is_available 
           FROM products 
           WHERE id = ? 
           FOR UPDATE`,
          [item.productId]
        );

        if (rows.length === 0) {
          throw new Error(`Product ID ${item.productId} does not exist`);
        }

        const product = rows[0];

        if (!product.is_available) {
          throw new Error(`Product "${product.name}" is no longer available`);
        }

        const currentStock = parseFloat(product.quantity);
        if (currentStock < reqQty) {
          throw new Error(
            `Insufficient stock for "${product.name}". Requested: ${reqQty} ${product.unit}, Available: ${currentStock} ${product.unit}`
          );
        }

        const unitPrice = parseFloat(product.price);
        const subtotal = parseFloat((unitPrice * reqQty).toFixed(2));
        calculatedTotal += subtotal;

        verifiedItems.push({
          productId: product.id,
          farmerId: product.farmer_id,
          name: product.name,
          unitPrice,
          unit: product.unit,
          quantity: reqQty,
          subtotal,
          remainingStock: currentStock - reqQty
        });
      }

      calculatedTotal = parseFloat(calculatedTotal.toFixed(2));

      // 2. Insert main order
      const [orderResult] = await connection.query(
        `INSERT INTO orders (customer_id, total_amount, delivery_address, delivery_phone, payment_method, notes, order_status)
         VALUES (?, ?, ?, ?, ?, ?, 'Pending')`,
        [customerId, calculatedTotal, deliveryAddress, deliveryPhone, paymentMethod, notes]
      );

      const orderId = orderResult.insertId;

      // 3. Insert order items & atomically decrease stock
      for (const item of verifiedItems) {
        await connection.query(
          `INSERT INTO order_items (order_id, product_id, farmer_id, quantity, unit_price, unit, subtotal, item_status)
           VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')`,
          [orderId, item.productId, item.farmerId, item.quantity, item.unitPrice, item.unit, item.subtotal]
        );

        // Update product stock and availability flag
        const isStillAvailable = item.remainingStock > 0 ? 1 : 0;
        await connection.query(
          `UPDATE products 
           SET quantity = ?, is_available = ? 
           WHERE id = ?`,
          [item.remainingStock, isStillAvailable, item.productId]
        );
      }

      // 4. Clear items from customer's cart
      const [cartRows] = await connection.query(
        'SELECT id FROM carts WHERE user_id = ? LIMIT 1',
        [customerId]
      );
      if (cartRows.length > 0) {
        await connection.query('DELETE FROM cart_items WHERE cart_id = ?', [cartRows[0].id]);
      }

      await connection.commit();

      return {
        orderId,
        totalAmount: calculatedTotal,
        itemCount: verifiedItems.length,
        status: 'Pending'
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getCustomerOrders(customerId) {
    const [orders] = await pool.execute(
      `SELECT o.*, u.name AS customer_name, u.email AS customer_email
       FROM orders o
       JOIN users u ON o.customer_id = u.id
       WHERE o.customer_id = ?
       ORDER BY o.created_at DESC`,
      [customerId]
    );

    for (const order of orders) {
      const [items] = await pool.execute(
        `SELECT oi.*, p.name AS product_name, p.image_url, u.name AS farmer_name, u.phone AS farmer_phone
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         JOIN users u ON oi.farmer_id = u.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    return orders;
  }

  static async getFarmerOrders(farmerId) {
    const [rows] = await pool.execute(
      `SELECT 
        oi.id AS order_item_id,
        oi.order_id,
        oi.product_id,
        oi.quantity,
        oi.unit_price,
        oi.unit,
        oi.subtotal,
        oi.item_status,
        oi.created_at AS item_created_at,
        p.name AS product_name,
        p.image_url,
        o.customer_id,
        o.delivery_address,
        o.delivery_phone,
        o.payment_method,
        o.order_status,
        o.created_at AS order_date,
        u.name AS customer_name,
        u.email AS customer_email
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       JOIN products p ON oi.product_id = p.id
       JOIN users u ON o.customer_id = u.id
       WHERE oi.farmer_id = ?
       ORDER BY oi.created_at DESC`,
      [farmerId]
    );
    return rows;
  }

  static async getFarmerDashboardStats(farmerId) {
    // 1. Total products
    const [prodRows] = await pool.execute(
      'SELECT COUNT(*) AS total_products FROM products WHERE farmer_id = ?',
      [farmerId]
    );

    // 2. Orders stats for this farmer
    const [orderItemRows] = await pool.execute(
      `SELECT 
        COUNT(DISTINCT order_id) AS total_orders,
        SUM(CASE WHEN item_status = 'Pending' THEN 1 ELSE 0 END) AS pending_orders,
        SUM(CASE WHEN item_status = 'Delivered' THEN 1 ELSE 0 END) AS completed_orders,
        COALESCE(SUM(CASE WHEN item_status != 'Rejected' THEN subtotal ELSE 0 END), 0) AS total_sales
       FROM order_items
       WHERE farmer_id = ?`,
      [farmerId]
    );

    return {
      totalProducts: prodRows[0].total_products || 0,
      totalOrders: orderItemRows[0].total_orders || 0,
      pendingOrders: Number(orderItemRows[0].pending_orders || 0),
      completedOrders: Number(orderItemRows[0].completed_orders || 0),
      totalSales: parseFloat(orderItemRows[0].total_sales || 0).toFixed(2)
    };
  }

  static async updateOrderItemStatus(farmerId, orderItemId, newStatus) {
    const validStatuses = ['Pending', 'Accepted', 'Shipped', 'Delivered', 'Rejected'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    // Verify ownership
    const [itemRows] = await pool.execute(
      'SELECT id, order_id, item_status FROM order_items WHERE id = ? AND farmer_id = ?',
      [orderItemId, farmerId]
    );

    if (itemRows.length === 0) {
      throw new Error('Order item not found or you are not authorized to manage it');
    }

    await pool.execute(
      'UPDATE order_items SET item_status = ? WHERE id = ?',
      [newStatus, orderItemId]
    );

    // Also update parent order status if all items are updated
    const orderId = itemRows[0].order_id;
    const [allSiblings] = await pool.execute(
      'SELECT item_status FROM order_items WHERE order_id = ?',
      [orderId]
    );

    const statuses = allSiblings.map(s => s.item_status);
    let parentStatus = 'Pending';
    if (statuses.every(s => s === 'Delivered')) {
      parentStatus = 'Delivered';
    } else if (statuses.some(s => s === 'Shipped')) {
      parentStatus = 'Shipped';
    } else if (statuses.some(s => s === 'Accepted')) {
      parentStatus = 'Accepted';
    } else if (statuses.every(s => s === 'Rejected')) {
      parentStatus = 'Rejected';
    }

    await pool.execute('UPDATE orders SET order_status = ? WHERE id = ?', [parentStatus, orderId]);

    return { orderItemId, newStatus, parentStatus };
  }

  static async getOrderById(orderId, userId, role) {
    let sql = `
      SELECT o.*, u.name AS customer_name, u.email AS customer_email
      FROM orders o
      JOIN users u ON o.customer_id = u.id
      WHERE o.id = ?
    `;
    const params = [orderId];

    if (role === 'customer') {
      sql += ' AND o.customer_id = ?';
      params.push(userId);
    }

    const [orders] = await pool.execute(sql, params);
    if (orders.length === 0) return null;

    const order = orders[0];

    let itemsSql = `
      SELECT oi.*, p.name AS product_name, p.image_url, u.name AS farmer_name, u.phone AS farmer_phone
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      JOIN users u ON oi.farmer_id = u.id
      WHERE oi.order_id = ?
    `;
    const itemParams = [orderId];

    if (role === 'farmer') {
      itemsSql += ' AND oi.farmer_id = ?';
      itemParams.push(userId);
    }

    const [items] = await pool.execute(itemsSql, itemParams);
    order.items = items;

    return order;
  }

  static async getAllOrdersAdmin() {
    const [orders] = await pool.execute(
      `SELECT o.*, u.name AS customer_name, u.email AS customer_email, u.phone AS customer_phone
       FROM orders o
       JOIN users u ON o.customer_id = u.id
       ORDER BY o.created_at DESC`
    );

    for (const order of orders) {
      const [items] = await pool.execute(
        `SELECT oi.*, p.name AS product_name, u.name AS farmer_name
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         JOIN users u ON oi.farmer_id = u.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    return orders;
  }

  static async getAdminStats() {
    const [orderCount] = await pool.execute('SELECT COUNT(*) AS count FROM orders');
    const [salesSum] = await pool.execute('SELECT COALESCE(SUM(total_amount), 0) AS total FROM orders WHERE order_status != "Cancelled" AND order_status != "Rejected"');
    return {
      totalOrders: orderCount[0].count,
      totalPlatformSales: parseFloat(salesSum[0].total).toFixed(2)
    };
  }
}

module.exports = OrderModel;

