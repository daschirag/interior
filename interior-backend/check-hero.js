require('dotenv').config();
const pool = require('./src/config/db');

pool.query("SELECT section_key, fields->>'kicker' as kicker FROM content_blocks WHERE section_key = 'dashboard-hero'")
  .then(r => {
    console.table(r.rows);
    process.exit(0);
  })
  .catch(e => {
    console.log('FAILED:', e.message);
    process.exit(1);
  });