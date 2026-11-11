const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function initDatabase() {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  // Allow password from CLI arg --password=xyz or env variable DB_PASSWORD
  let password = process.env.DB_PASSWORD || '';
  const passArg = process.argv.find(arg => arg.startsWith('--password='));
  if (passArg) {
    password = passArg.split('=')[1];
  }

  console.log(`\n==================================================`);
  console.log(`  FARMER MARKETPLACE — DATABASE INITIALIZER`);
  console.log(`==================================================`);
  console.log(`Target Host: ${host}:${port}`);
  console.log(`Target User: ${user}`);
  console.log(`Database:   farmer_marketplace`);

  try {
    // 1. First connect to MySQL server without selecting database
    const connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      multipleStatements: true
    });

    console.log(`[1/4] Connected to MySQL Server successfully.`);

    // 2. Read schema.sql
    const schemaPath = path.join(__dirname, '..', 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log(`[2/4] Executing schema.sql...`);
    await connection.query(sql);
    console.log(`[3/4] Schema executed successfully.`);

    // 3. Verify tables
    const [tables] = await connection.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'farmer_marketplace'
      ORDER BY table_name;
    `);

    console.log(`[4/4] Verifying created tables in 'farmer_marketplace':`);
    const tableNames = tables.map(t => t.TABLE_NAME || t.table_name);
    tableNames.forEach(t => console.log(`   - ${t}`));

    const [userCount] = await connection.query(`SELECT COUNT(*) AS count FROM farmer_marketplace.users;`);
    const [prodCount] = await connection.query(`SELECT COUNT(*) AS count FROM farmer_marketplace.products;`);
    const [priceCount] = await connection.query(`SELECT COUNT(*) AS count FROM farmer_marketplace.market_prices;`);

    console.log(`\nDatabase Summary:`);
    console.log(`   - Total Users Seeded:    ${userCount[0].count}`);
    console.log(`   - Total Products Seeded: ${prodCount[0].count}`);
    console.log(`   - Market Prices Seeded:  ${priceCount[0].count}`);
    console.log(`\nAll database tables and constraints are in place!`);

    await connection.end();
    return true;
  } catch (error) {
    console.error(`\nDatabase Initialization Error:`, error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error(`\nAccess Denied: Please check your MySQL root password in server/.env or run:`);
      console.error(`node scripts/initDb.js --password=YOUR_PASSWORD`);
    }
    return false;
  }
}

if (require.main === module) {
  initDatabase().then(success => {
    if (!success) process.exit(1);
  });
}

module.exports = initDatabase;

