const pool = require("../config/db");

const createTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await pool.query(query);
};

const create = async ({ name, email, password }) => {
  const query = `
    INSERT INTO users (name, email, password)
    VALUES ($1, $2, $3)
    RETURNING id, name, email;
  `;

  const result = await pool.query(query, [
    name,
    email,
    password,
  ]);

  return result.rows[0];
};

const findByEmail = async (email) => {
  const query = `
    SELECT * FROM users
    WHERE email = $1;
  `;

  const result = await pool.query(query, [email]);

  return result.rows[0];
};

const findById = async (id) => {
  const query = `
    SELECT id, name, email, created_at
    FROM users
    WHERE id = $1;
  `;

  const result = await pool.query(query, [id]);

  return result.rows[0];
};

const updateProfile = async (id, name) => {
  const query = `
    UPDATE users
    SET name = $1
    WHERE id = $2
    RETURNING id, name, email, created_at;
  `;

  const result = await pool.query(query, [
    name,
    id,
  ]);

  return result.rows[0];
};

module.exports = {
  createTable,
  create,
  findByEmail,
  findById,
  updateProfile,
};