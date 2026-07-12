require('dotenv').config();

async function main() {
  // Login first
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'integration-test@vinayaka.local',
      password: 'TestPass123!'
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