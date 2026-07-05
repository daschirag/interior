/**
 * Starts server, runs integration tests, then stops server.
 * Usage: npm run test:integration:full
 */
const { spawn } = require("child_process");
const path = require("path");

const root = path.join(__dirname, "..");
const port = process.env.PORT || 5000;
const base = `http://localhost:${port}`;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(maxAttempts = 20) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(base + "/");
      if (res.ok) return true;
    } catch {
      // server not ready yet
    }
    await wait(500);
  }
  return false;
}

function runNode(script) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [script], {
      cwd: root,
      stdio: "inherit",
      env: process.env,
    });
    child.on("close", (code) => resolve(code ?? 1));
  });
}

async function main() {
  console.log("Starting server for integration tests...\n");

  const server = spawn(process.execPath, ["server.js"], {
    cwd: root,
    stdio: ["ignore", "pipe", "pipe"],
    env: process.env,
  });

  server.stdout.on("data", (d) => process.stdout.write(d));
  server.stderr.on("data", (d) => process.stderr.write(d));

  const ready = await waitForServer();
  if (!ready) {
    console.error(
      "\nServer did not start on " +
        base +
        ".\nCheck interior-backend/.env (Supabase password/host) and try again.\n",
    );
    server.kill();
    process.exit(1);
  }

  console.log("\nServer ready. Running tests...\n");
  const code = await runNode(path.join("database", "step3-integration-test.js"));
  server.kill();
  process.exit(code);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
