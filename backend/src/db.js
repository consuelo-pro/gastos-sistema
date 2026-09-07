import pg from 'pg';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // necesario para Supabase/Neon
});

export async function insertTransaction({
  type,
  amount,
  category,
  description,
  originalMessage,
  occurredOn,
  sourcePhone,
}) {
  const result = await pool.query(
    `INSERT INTO transactions (type, amount, category, description, original_message, occurred_on, source_phone)
     VALUES ($1, $2, $3, $4, $5, COALESCE($6, CURRENT_DATE), $7)
     RETURNING *`,
    [type, amount, category, description, originalMessage, occurredOn, sourcePhone]
  );
  return result.rows[0];
}

export async function listTransactions({ from, to, type, category, limit = 200 } = {}) {
  const conditions = [];
  const params = [];

  if (from) {
    params.push(from);
    conditions.push(`occurred_on >= $${params.length}`);
  }
  if (to) {
    params.push(to);
    conditions.push(`occurred_on <= $${params.length}`);
  }
  if (type) {
    params.push(type);
    conditions.push(`type = $${params.length}`);
  }
  if (category) {
    params.push(category);
    conditions.push(`category = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  params.push(limit);

  const result = await pool.query(
    `SELECT * FROM transactions ${where} ORDER BY occurred_on DESC, created_at DESC LIMIT $${params.length}`,
    params
  );
  return result.rows;
}

export async function getSummary({ from, to } = {}) {
  const params = [];
  const conditions = [];

  if (from) {
    params.push(from);
    conditions.push(`occurred_on >= $${params.length}`);
  }
  if (to) {
    params.push(to);
    conditions.push(`occurred_on <= $${params.length}`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const totals = await pool.query(
    `SELECT type, COALESCE(SUM(amount), 0) AS total
     FROM transactions ${where}
     GROUP BY type`,
    params
  );

  const byCategory = await pool.query(
    `SELECT type, category, COALESCE(SUM(amount), 0) AS total, COUNT(*) AS count
     FROM transactions ${where}
     GROUP BY type, category
     ORDER BY total DESC`,
    params
  );

  return { totals: totals.rows, byCategory: byCategory.rows };
}

export async function deleteTransaction(id) {
  await pool.query('DELETE FROM transactions WHERE id = $1', [id]);
}
