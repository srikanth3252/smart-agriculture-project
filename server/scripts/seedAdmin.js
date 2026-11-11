const bcrypt = require('bcryptjs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function seedAdmin() {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'farmer_marketplace';

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@farmer.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
  const adminName = process.env.ADMIN_NAME || 'System Administrator';
  const adminPhone = process.env.ADMIN_PHONE || '9999999999';

  console.log(`\n--- Initializing Admin Account ---`);
  console.log(`Admin Email: ${adminEmail}`);

  try {
    const connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database
    });

    const [existing] = await connection.execute(
      'SELECT id, email, role FROM users WHERE email = ? OR role = "admin" LIMIT 1',
      [adminEmail]
    );

    if (existing.length > 0) {
      console.log(`Admin account already exists: ${existing[0].email} (ID: ${existing[0].id})`);
      await connection.end();
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const [result] = await connection.execute(
      `INSERT INTO users (name, email, phone, password, role, address)
       VALUES (?, ?, ?, ?, 'admin', 'HQ Agricultural Commission')`,
      [adminName, adminEmail, adminPhone, hashedPassword]
    );

    console.log(`Admin account created successfully! User ID: ${result.insertId}`);
    console.log(`Credentials:`);
    console.log(`Email:    ${adminEmail}`);
    console.log(`Password: ${adminPassword} (use to log in, recommend changing in production)`);

    await connection.end();
  } catch (err) {
    console.error('Failed to seed admin account:', err.message);
  }
}

if (require.main === module) {
  seedAdmin();
}

module.exports = seedAdmin;

