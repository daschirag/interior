/**
 * Set a new password for an existing admin account, without needing the old one.
 *
 * Email and new password are read from an interactive terminal prompt; the password is
 * typed twice with hidden input. It is never accepted as a command-line argument, never
 * logged, and never written to a file. Only the matching user's `password` column changes.
 *
 * Usage (PowerShell or cmd — Git Bash needs: winpty node scripts/reset-admin-password.js):
 *   node scripts/reset-admin-password.js
 */
require("dotenv").config({ quiet: true });
const readline = require("readline");
const bcrypt = require("bcryptjs");
const pool = require("../src/config/db");

// Same hashing as scripts/create-admin.js (bcryptjs, cost 12); authService.loginUser verifies with bcrypt.compare.
const MIN_PASSWORD_LENGTH = 12;
const BCRYPT_ROUNDS = 12;

function ask(prompt) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/** Reads one line with nothing echoed to the terminal. */
function askHidden(prompt) {
  return new Promise((resolve, reject) => {
    const stdin = process.stdin;
    let value = "";
    process.stdout.write(prompt);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");

    function cleanup() {
      stdin.removeListener("data", onData);
      stdin.setRawMode(false);
      stdin.pause();
      process.stdout.write("\n");
    }

    function onData(chunk) {
      for (const ch of chunk) {
        if (ch === "\r" || ch === "\n") {
          cleanup();
          return resolve(value);
        }
        if (ch === "\u0003") {
          cleanup();
          return reject(new Error("Cancelled"));
        }
        if (ch === "\u007f" || ch === "\b") {
          value = value.slice(0, -1);
          continue;
        }
        value += ch;
      }
    }

    stdin.on("data", onData);
  });
}

/** The host src/config/db.js actually connects to: DATABASE_URL wins over DB_HOST. Never includes credentials. */
function targetHost() {
  if (process.env.DATABASE_URL) {
    try {
      return `${new URL(process.env.DATABASE_URL).hostname} (from DATABASE_URL)`;
    } catch {
      return "(DATABASE_URL is set but could not be parsed)";
    }
  }
  return process.env.DB_HOST || "(DB_HOST is not set)";
}

(async () => {
  if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== "function") {
    throw new Error(
      "Run this in an interactive terminal (PowerShell / cmd, or `winpty node ...` in Git Bash). " +
        "Piped input is refused so the password never passes through shell history or files.",
    );
  }
  if (process.argv.length > 2) {
    throw new Error("This script takes no arguments — email and password are prompted for.");
  }

  // Same normalisation and exact match as login (authService lowercases, userModel.findByEmail matches exactly).
  const email = (await ask("Admin email: ")).toLowerCase();
  if (!email) throw new Error("No email entered.");

  const found = await pool.query("SELECT id, email FROM users WHERE email = $1", [email]);
  if (found.rows.length !== 1) throw new Error(`No admin account has the email ${email}.`);
  const user = found.rows[0];

  const password = await askHidden(`New password (min ${MIN_PASSWORD_LENGTH} characters, hidden): `);
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
  const confirm = await askHidden("Confirm new password: ");
  if (confirm !== password) throw new Error("Passwords don't match.");

  console.log(`This will write to database host: ${targetHost()}`);
  const answer = await ask("Type RESET to update the password: ");
  if (answer !== "RESET") throw new Error("Confirmation not given.");

  const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const result = await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hash, user.id]);
  if (result.rowCount !== 1) throw new Error("The account could not be updated.");

  console.log(`Password updated for ${user.email}`);
})()
  .catch((e) => {
    console.error(`Nothing was changed: ${e.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
    process.exit(); // stdin may still hold the event loop open after the prompts
  });
