const { Pool } = require('pg');
const { randomBytes } = require('node:crypto');
const { createServer } = require('./server');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3, connectionTimeoutMillis: 8000 });

/** درخواست‌های نسخهٔ ابری را سری می‌کند تا دو نمونهٔ سرور نتوانند یک موجودی یا بازهٔ تحویل را هم‌زمان بفروشند. */
async function cloudHandler(req, res) {
  let client;
  const end = res.end.bind(res);
  try {
    client = await pool.connect();
    await client.query('BEGIN');
    await client.query("SET LOCAL lock_timeout = '10s'");
    await client.query("SET LOCAL statement_timeout = '15s'");
    const result = await client.query('SELECT data FROM store_state WHERE id = 1 FOR UPDATE');
    if (!result.rows.length) throw new Error('Store not initialized');
    const state = result.rows[0].data;
    const sessions = new Map(Object.entries(state.sessions || {}));
    delete state.sessions;
    const origin = process.env.STORE_ORIGIN;
    if (!origin) throw new Error('STORE_ORIGIN is required');
    const app = createServer({ state, origins: [origin], quiet: true, auth: { sessions }, files: {
      async save(buffer) {
        const id = randomBytes(16).toString('hex');
        await client.query('INSERT INTO store_files (id, content) VALUES ($1, $2)', [id, buffer]);
        return id;
      },
      async read(id) { return (await client.query('SELECT content FROM store_files WHERE id = $1', [id])).rows[0]?.content; },
      async list() { return (await client.query('SELECT id FROM store_files ORDER BY id')).rows.map(row => row.id); },
    } });
    // end تا COMMIT منتظر می‌ماند؛ خود تابع نیز پایان پاسخ را await می‌کند تا اجرای serverless زود تمام نشود.
    await new Promise((resolve, reject) => {
      let finishing = false;
      const chunks = [];
      const timer = setTimeout(() => {
        if (!finishing) { finishing = true; reject(new Error('Response timeout')); }
      }, 20000);
      res.write = (chunk, encoding, callback) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, typeof encoding === 'string' ? encoding : undefined));
        if (typeof encoding === 'function') encoding();
        else if (callback) callback();
        return true;
      };
      res.end = (chunk, encoding, callback) => {
        if (finishing) return res;
        finishing = true;
        clearTimeout(timer);
        (async () => {
          if (res.statusCode >= 500) await client.query('ROLLBACK');
          else {
            const next = app.locals.store.getState();
            next.sessions = Object.fromEntries(sessions);
            await client.query('UPDATE store_state SET data = $1 WHERE id = 1', [JSON.stringify(next)]);
            await client.query('COMMIT');
          }
          if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, typeof encoding === 'string' ? encoding : undefined));
          end(Buffer.concat(chunks), typeof encoding === 'function' ? encoding : callback);
          resolve();
        })().catch(reject);
        return res;
      };
      try { app(req, res); } catch (error) { clearTimeout(timer); reject(error); }
    });
  } catch (error) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    console.error('Store request failed:', error.code || error.name);
    if (!res.headersSent) {
      res.removeHeader('Set-Cookie'); res.removeHeader('Content-Length'); res.removeHeader('ETag');
      res.statusCode = 503;
      res.setHeader('Content-Type', 'application/json');
      end(JSON.stringify({ code: 'STORAGE_UNAVAILABLE' }));
    } else res.destroy();
  } finally { client?.release(); }
}
module.exports = { cloudHandler };
