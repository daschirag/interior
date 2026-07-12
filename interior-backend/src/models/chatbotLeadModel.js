const pool = require("../config/db");

let tableReady = null;

async function ensureChatbotLeadsTable() {
  if (tableReady) return tableReady;
  tableReady = pool.query(`
    CREATE TABLE IF NOT EXISTS chatbot_leads (
      id SERIAL PRIMARY KEY,
      session_id TEXT,
      name TEXT,
      phone TEXT,
      email TEXT,
      original_question TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  return tableReady;
}

async function createChatbotLead({
  sessionId,
  name,
  phone,
  email,
  originalQuestion,
}) {
  await ensureChatbotLeadsTable();
  const result = await pool.query(
    `
    INSERT INTO chatbot_leads
      (session_id, name, phone, email, original_question)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `,
    [
      sessionId || null,
      name || null,
      phone || null,
      email || null,
      originalQuestion || null,
    ],
  );
  return result.rows[0];
}

module.exports = {
  ensureChatbotLeadsTable,
  createChatbotLead,
};
