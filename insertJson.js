const pool = require('./db');

async function createTableIfNotExists() {
  const query = `
    CREATE TABLE IF NOT EXISTS items (
      id SERIAL PRIMARY KEY,
      name TEXT,
      location TEXT,
      price INTEGER,
      rating REAL,
      images JSONB,
      inserted_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await pool.query(query);
}

async function insertItem(data) {
  await createTableIfNotExists();

  const { name, location, price, rating, images } = data;
  const query = `
    INSERT INTO items (name, location, price, rating, images)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const values = [name, location, price, rating, images];

  const result = await pool.query(query, values);
  console.log('Eingefügt:', result.rows[0]);
}

module.exports = insertItem;
