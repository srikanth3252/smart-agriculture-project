const { pool } = require('../config/db');

class ProductModel {
  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT p.*, u.name AS farmer_name, u.phone AS farmer_phone, u.email AS farmer_email
       FROM products p
       JOIN users u ON p.farmer_id = u.id
       WHERE p.id = ?
       LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }

  static async findByFarmer(farmerId) {
    const [rows] = await pool.execute(
      `SELECT p.*, u.name AS farmer_name
       FROM products p
       JOIN users u ON p.farmer_id = u.id
       WHERE p.farmer_id = ?
       ORDER BY p.created_at DESC`,
      [farmerId]
    );
    return rows;
  }

  static async findFiltered({
    search,
    category,
    location,
    minPrice,
    maxPrice,
    sort = 'newest',
    limit = 20,
    offset = 0,
    farmerId,
    onlyAvailable = true
  }) {
    let sql = `
      SELECT p.*, u.name AS farmer_name, u.phone AS farmer_phone, u.email AS farmer_email
      FROM products p
      JOIN users u ON p.farmer_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (onlyAvailable) {
      sql += ' AND p.is_available = 1 AND p.quantity > 0';
    }

    if (farmerId) {
      sql += ' AND p.farmer_id = ?';
      params.push(farmerId);
    }

    if (search) {
      sql += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (category && category !== 'All') {
      sql += ' AND p.category = ?';
      params.push(category);
    }

    if (location) {
      sql += ' AND p.location LIKE ?';
      params.push(`%${location}%`);
    }

    if (minPrice !== undefined && minPrice !== null && minPrice !== '') {
      sql += ' AND p.price >= ?';
      params.push(Number(minPrice));
    }

    if (maxPrice !== undefined && maxPrice !== null && maxPrice !== '') {
      sql += ' AND p.price <= ?';
      params.push(Number(maxPrice));
    }

    // Sorting
    switch (sort) {
      case 'price_asc':
        sql += ' ORDER BY p.price ASC';
        break;
      case 'price_desc':
        sql += ' ORDER BY p.price DESC';
        break;
      case 'name_asc':
        sql += ' ORDER BY p.name ASC';
        break;
      case 'newest':
      default:
        sql += ' ORDER BY p.created_at DESC';
        break;
    }

    sql += ' LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const [rows] = await pool.query(sql, params);
    return rows;
  }

  static async countFiltered({
    search,
    category,
    location,
    minPrice,
    maxPrice,
    farmerId,
    onlyAvailable = true
  }) {
    let sql = 'SELECT COUNT(*) AS total FROM products p WHERE 1=1';
    const params = [];

    if (onlyAvailable) {
      sql += ' AND p.is_available = 1 AND p.quantity > 0';
    }

    if (farmerId) {
      sql += ' AND p.farmer_id = ?';
      params.push(farmerId);
    }

    if (search) {
      sql += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (category && category !== 'All') {
      sql += ' AND p.category = ?';
      params.push(category);
    }

    if (location) {
      sql += ' AND p.location LIKE ?';
      params.push(`%${location}%`);
    }

    if (minPrice) {
      sql += ' AND p.price >= ?';
      params.push(Number(minPrice));
    }

    if (maxPrice) {
      sql += ' AND p.price <= ?';
      params.push(Number(maxPrice));
    }

    const [rows] = await pool.query(sql, params);
    return rows[0].total;
  }

  static async create({
    farmer_id,
    name,
    category,
    description = '',
    price,
    quantity,
    unit = 'kg',
    location,
    image_url = null,
    is_available = true
  }) {
    const [result] = await pool.execute(
      `INSERT INTO products (farmer_id, name, category, description, price, quantity, unit, location, image_url, is_available)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [farmer_id, name, category, description, price, quantity, unit, location, image_url, is_available ? 1 : 0]
    );
    return result.insertId;
  }

  static async update(id, farmer_id, data) {
    const fields = [];
    const params = [];

    const allowed = ['name', 'category', 'description', 'price', 'quantity', 'unit', 'location', 'image_url', 'is_available'];
    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(key === 'is_available' ? (data[key] ? 1 : 0) : data[key]);
      }
    }

    if (fields.length === 0) return null;

    params.push(id);
    let sql = `UPDATE products SET ${fields.join(', ')} WHERE id = ?`;
    if (farmer_id !== null) {
      sql += ' AND farmer_id = ?';
      params.push(farmer_id);
    }

    const [result] = await pool.execute(sql, params);
    return result.affectedRows > 0;
  }

  static async delete(id, farmer_id = null) {
    let sql = 'DELETE FROM products WHERE id = ?';
    const params = [id];
    if (farmer_id !== null) {
      sql += ' AND farmer_id = ?';
      params.push(farmer_id);
    }
    const [result] = await pool.execute(sql, params);
    return result.affectedRows > 0;
  }

  static async getAllForAdmin() {
    const [rows] = await pool.execute(
      `SELECT p.*, u.name AS farmer_name, u.email AS farmer_email
       FROM products p
       JOIN users u ON p.farmer_id = u.id
       ORDER BY p.created_at DESC`
    );
    return rows;
  }

  static async getStats() {
    const [total] = await pool.execute('SELECT COUNT(*) AS count FROM products');
    const [active] = await pool.execute('SELECT COUNT(*) AS count FROM products WHERE is_available = 1 AND quantity > 0');
    return {
      totalProducts: total[0].count,
      activeProducts: active[0].count
    };
  }
}

module.exports = ProductModel;

