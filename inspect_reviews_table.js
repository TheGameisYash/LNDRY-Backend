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
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'reviews'
    `);
    console.table(res.rows);
  } catch (e) {
    console.error(e.message);
  } finally {
    await pool.end();
  }
}
run();
