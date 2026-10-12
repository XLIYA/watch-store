const { Pool } = require('pg');
const fs = require('node:fs');
const path = require('node:path');
const { randomBytes, scryptSync } = require('node:crypto');

/** فقط اولین استقرار را seed می‌کند؛ اجرای دوباره هرگز سفارش یا موجودی نسخهٔ آنلاین را بازنویسی نمی‌کند. */
async function initialize() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('CREATE TABLE IF NOT EXISTS store_state (id integer PRIMARY KEY CHECK (id = 1), data jsonb NOT NULL)');
    await client.query('CREATE TABLE IF NOT EXISTS store_files (id text PRIMARY KEY, content bytea NOT NULL)');
    if ((await client.query('SELECT id FROM store_state WHERE id = 1')).rowCount) {
      await client.query('COMMIT');
      console.log('Store already initialized; no data changed.');
      return;
    }
    if (!process.env.CLOUD_ADMIN_PASSWORD) throw new Error('CLOUD_ADMIN_PASSWORD is required for first initialization');
    const state = JSON.parse(fs.readFileSync(path.join(__dirname, 'db.json'), 'utf8'));
    state.users = state.users.filter(user => user.role === 'admin').map(user => {
      const passwordSalt = randomBytes(16).toString('hex');
      const rest = { ...user };
      delete rest.password;
      return { ...rest, passwordSalt, passwordHash: scryptSync(process.env.CLOUD_ADMIN_PASSWORD, passwordSalt, 64).toString('hex') };
    });
    if (!state.users.length) throw new Error('Admin user missing');
    state.sessions = {};
    const inserted = await client.query('INSERT INTO store_state (id, data) VALUES (1, $1) ON CONFLICT (id) DO NOTHING RETURNING id', [JSON.stringify(state)]);
    // تصاویر سفارش‌های قبلی نیز نگه داشته می‌شوند تا snapshotهای تاریخی لینک شکسته نداشته باشند.
    const uploads = path.join(__dirname, 'uploads');
    if (inserted.rowCount && fs.existsSync(uploads)) {
      for (const name of fs.readdirSync(uploads)) {
        if (/^[a-f0-9]{32}$/.test(name)) await client.query('INSERT INTO store_files (id, content) VALUES ($1, $2) ON CONFLICT DO NOTHING', [name, fs.readFileSync(path.join(uploads, name))]);
      }
    }
    await client.query('COMMIT');
    console.log(inserted.rowCount ? `Initialized ${state.products.length} products; existing order snapshots preserved.` : 'Store already initialized; no data changed.');
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); await pool.end(); }
}
initialize().catch(error => { console.error('Initialization failed:', error.code || error.name); process.exitCode = 1; });
