const { Pool } = require("pg");

const ssl = { rejectUnauthorized: false };

const poolOptions = {
  ssl,
  family: 4,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ...poolOptions,
    })
  : new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ...poolOptions,
    });

pool.on("error", (err) => {
  console.error("Unexpected PG pool error (idle client):", err.message);
});

module.exports = pool;
