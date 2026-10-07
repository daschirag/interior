/**
 * Create a CMS admin account (every account in `users` can use the admin panel).
 *
 * Email and password are read from an interactive terminal prompt; the password is
 * typed with hidden input. It is never accepted as a command-line argument, never
 * logged, and never written to a file. Refuses to touch an existing account.
 *
 * Usage (PowerShell or cmd — Git Bash needs: winpty node scripts/create-admin.js):
 *   node scripts/create-admin.js
 */
require("dotenv").config({ quiet: true });
const readline = require("readline");
const bcrypt = require("bcryptjs");
const pool = require("../src/config/db");

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

  console.log(`Database: ${process.env.DB_HOST || "(DATABASE_URL)"}`);

  const email = (await ask("Admin email: ")).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("That doesn't look like an email address.");

  const name = (await ask("Display name [Admin]: ")) || "Admin";

  const existing = await pool.query("SELECT id FROM users WHERE lower(email) = $1", [email]);
  if (existing.rows.length) throw new Error("An account with that email already exists — nothing was changed.");

  const password = await askHidden(`Password (min ${MIN_PASSWORD_LENGTH} characters, hidden): `);
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters — nothing was changed.`);
  }
  const confirm = await askHidden("Confirm password: ");
  if (confirm !== password) throw new Error("Passwords don't match — nothing was changed.");

  const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const { rows } = await pool.query(
    "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, email, created_at",
    [name, email, hash],
  );
  console.log(`Created admin #${rows[0].id} (${rows[0].email}). Log in on the admin panel to confirm it works.`);
})()
  .catch((e) => {
    console.error("Not created:", e.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
    process.exit(); // stdin may still hold the event loop open after the prompts
  });
