import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'grocery_user',
  password: 'grocery_password_dev',
  database: 'grocery_db'
});

async function run() {
  try {
    const res = await pool.query(`
      SELECT enumlabel 
      FROM pg_enum 
      JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
      WHERE pg_type.typname = 'order_status'
    `);
    console.log('Enum values for order_status:');
    console.log(res.rows.map(r => r.enumlabel));
  } catch (e) {
    console.error("Error:", e.message);
  } finally {
    await pool.end();
  }
}
run();
