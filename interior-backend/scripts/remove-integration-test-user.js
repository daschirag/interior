/**
 * Deletes integration-test@vinayaka.local — run ONLY after the new admin (created with
 * scripts/create-admin.js) has logged in successfully on the production admin panel.
 *
 * Guards: interactive terminal only; the new admin's email must exist and differ from
 * the test account; you must type DELETE. Afterwards, rotate JWT_SECRET on Render so
 * any token already issued to the test account stops working.
 *
 * Usage (PowerShell or cmd): node scripts/remove-integration-test-user.js
 */
require("dotenv").config({ quiet: true });
const readline = require("readline");
const pool = require("../src/config/db");

const TEST_EMAIL = "integration-test@vinayaka.local";

function ask(prompt) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(prompt, (a) => {
      rl.close();
      resolve(a.trim());
    });
  });
}

(async () => {
  if (!process.stdin.isTTY) throw new Error("Run this in an interactive terminal.");
  console.log(`Database: ${process.env.DB_HOST || "(DATABASE_URL)"}`);

  const test = await pool.query("SELECT id FROM users WHERE email = $1", [TEST_EMAIL]);
  if (!test.rows.length) {
    console.log(`${TEST_EMAIL} does not exist — nothing to do.`);
    return;
  }

  const adminEmail = (await ask("Email of the NEW admin you have already logged in with on production: ")).toLowerCase();
  if (!adminEmail || adminEmail === TEST_EMAIL) throw new Error("Enter the new admin's email, not the test account.");
  const admin = await pool.query("SELECT id FROM users WHERE lower(email) = $1", [adminEmail]);
  if (!admin.rows.length) throw new Error(`No account ${adminEmail} — create it and log in with it first. Nothing deleted.`);

  const answer = await ask(`Type DELETE to remove ${TEST_EMAIL} (user #${test.rows[0].id}): `);
  if (answer !== "DELETE") throw new Error("Not confirmed — nothing deleted.");

  const del = await pool.query("DELETE FROM users WHERE email = $1 RETURNING id", [TEST_EMAIL]);
  const left = await pool.query("SELECT count(*)::int n FROM users");
  console.log(`Deleted user #${del.rows[0].id}. Accounts remaining: ${left.rows[0].n}.`);
  console.log("Next: rotate JWT_SECRET on Render (and in your local .env), redeploy, and log in again.");
})()
  .catch((e) => {
    console.error("Stopped:", e.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
    process.exit(); // stdin may still hold the event loop open after the prompts
  });
