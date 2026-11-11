const { pool } = require('../config/db');

class PriceModel {
  static async getAll() {
    const [rows] = await pool.execute(
      `SELECT * FROM market_prices ORDER BY crop_name ASC`
    );
    return rows;
  }

  static async getByName(cropName) {
    const [rows] = await pool.execute(
      `SELECT * FROM market_prices WHERE crop_name = ? LIMIT 1`,
      [cropName]
    );
    return rows[0] || null;
  }

  static async create({ crop_name, category = 'General', unit = 'quintal', high_price, good_price, average_price, low_price }) {
    const [result] = await pool.execute(
      `INSERT INTO market_prices (crop_name, category, unit, high_price, good_price, average_price, low_price)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        category = VALUES(category),
        unit = VALUES(unit),
        high_price = VALUES(high_price),
        good_price = VALUES(good_price),
        average_price = VALUES(average_price),
        low_price = VALUES(low_price)`,
      [crop_name, category, unit, high_price, good_price, average_price, low_price]
    );
    return result.insertId;
  }

  static async update(id, { high_price, good_price, average_price, low_price }) {
    await pool.execute(
      `UPDATE market_prices 
       SET high_price = ?, good_price = ?, average_price = ?, low_price = ?
       WHERE id = ?`,
      [high_price, good_price, average_price, low_price, id]
    );
    const [rows] = await pool.execute('SELECT * FROM market_prices WHERE id = ?', [id]);
    return rows[0] || null;
  }
}

module.exports = PriceModel;

