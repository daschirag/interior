require('dotenv').config();

const { TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD } = process.env;
if (!TEST_ADMIN_EMAIL || !TEST_ADMIN_PASSWORD) {
  console.error('Set TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD (e.g. in .env) to run this test.');
  process.exit(1);
}

async function main() {
  // Login first
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: TEST_ADMIN_EMAIL,
      password: TEST_ADMIN_PASSWORD
    })
  });
  const { token } = await loginRes.json();

  // Reset dashboard-hero to defaults
  const resetRes = await fetch('http://localhost:5000/api/content-blocks/dashboard-hero/reset-to-default', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const result = await resetRes.json();
  console.log(JSON.stringify(result, null, 2));
}

main();