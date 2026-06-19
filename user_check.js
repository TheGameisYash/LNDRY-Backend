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
      SELECT id, email, role, platform_role, is_active FROM users WHERE email='admin@bakaloo.com'
    `);
        console.table(res.rows);
    } catch (e) {
        console.error(e.message);
    } finally { pool.end(); }
}
run();
