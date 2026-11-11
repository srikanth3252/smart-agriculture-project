const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication token provided.'
      });
    }

    const secret = process.env.JWT_SECRET || 'super_secret_farmer_marketplace_jwt_key_2026_dev';
    
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token. Please log in again.'
      });
    }

    // Verify user exists and is active in database
    const [rows] = await pool.execute(
      'SELECT id, name, email, phone, role, address, is_active FROM users WHERE id = ? LIMIT 1',
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists.'
      });
    }

    const user = rows[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  authenticateToken
};

