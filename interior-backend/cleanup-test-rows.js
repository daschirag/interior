require('dotenv').config();
const pool = require('./src/config/db');

const testEmails = [
  'lead@test.com',
  'step2cms@test.com',
  'step2analytics@test.com',
  'step3@test.com',
  'daschirag72@gmail.com'
];

pool.query(
  'DELETE FROM contact_submissions WHERE email = ANY($1)',
  [testEmails]
).then(r => {
  console.log('Deleted rows:', r.rowCount);
  process.exit(0);
}).catch(e => {
  console.log('FAILED:', e.message);
  process.exit(1);
});