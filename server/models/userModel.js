const { pool } = require('../config/db');

class UserModel {
  static async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    return rows[0] || null;
  }

  static async findByPhone(phone) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE phone = ? LIMIT 1',
      [phone]
    );
    return rows[0] || null;
  }

  static async findByEmailOrPhone(identifier) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ? OR phone = ? LIMIT 1',
      [identifier, identifier]
    );
    return rows[0] || null;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, name, email, phone, role, address, is_active, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  }

  static async create({ name, email, phone, password, role = 'customer', address = '' }) {
    const [result] = await pool.execute(
      `INSERT INTO users (name, email, phone, password, role, address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, phone, password, role, address]
    );
    return result.insertId;
  }

  static async updateProfile(id, { name, phone, address }) {
    await pool.execute(
      `UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?`,
      [name, phone, address, id]
    );
    return this.findById(id);
  }

  static async getAllUsers() {
    const [rows] = await pool.execute(
      `SELECT id, name, email, phone, role, address, is_active, created_at 
       FROM users 
       ORDER BY created_at DESC`
    );
    return rows;
  }

  static async toggleStatus(id, isActive) {
    await pool.execute(
      'UPDATE users SET is_active = ? WHERE id = ?',
      [isActive ? 1 : 0, id]
    );
    return this.findById(id);
  }

  static async getStats() {
    const [totalUsers] = await pool.execute('SELECT COUNT(*) AS count FROM users');
    const [totalFarmers] = await pool.execute("SELECT COUNT(*) AS count FROM users WHERE role = 'farmer'");
    const [totalCustomers] = await pool.execute("SELECT COUNT(*) AS count FROM users WHERE role = 'customer'");

    return {
      totalUsers: totalUsers[0].count,
      totalFarmers: totalFarmers[0].count,
      totalCustomers: totalCustomers[0].count
    };
  }
}

module.exports = UserModel;

