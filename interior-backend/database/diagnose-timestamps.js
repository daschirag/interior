require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const pool = require("../src/config/db");
const { formatIST } = require("../../admin-panel/src/utils/formatDateTime.js");

async function main() {
  const tz = await pool.query(`
    SELECT
      current_setting('TIMEZONE') AS pg_tz,
      NOW() AS pg_now,
      NOW() AT TIME ZONE 'UTC' AS pg_now_utc,
      CURRENT_TIMESTAMP AS current_ts
  `);

  console.log("=== Postgres clock ===");
  console.log(tz.rows[0]);

  const cb = await pool.query(`
    SELECT id, section_key, edited_at, edited_at::text AS edited_at_text
    FROM content_block_history
    ORDER BY id DESC
    LIMIT 5
  `);

  const eh = await pool.query(`
    SELECT id, entity_type, entity_id, edited_at, edited_at::text AS edited_at_text
    FROM entity_history
    ORDER BY id DESC
    LIMIT 5
  `);

  const nodeNow = new Date();
  console.log("\n=== Node process ===");
  console.log("TZ env:", process.env.TZ || "(not set)");
  console.log("Node toISOString (UTC):", nodeNow.toISOString());
  console.log("Node toString (local):", nodeNow.toString());

  console.log("\n=== content_block_history (latest 5) ===");
  for (const row of cb.rows) {
    const d = row.edited_at;
    console.log({
      id: row.id,
      section_key: row.section_key,
      edited_at_text_raw: row.edited_at_text,
      pg_driver_date_iso: d instanceof Date ? d.toISOString() : d,
      api_json: JSON.stringify({ edited_at: d }),
      formatIST: formatIST(d),
    });
  }

  console.log("\n=== entity_history (latest 5) ===");
  for (const row of eh.rows) {
    const d = row.edited_at;
    console.log({
      id: row.id,
      entity_type: row.entity_type,
      edited_at_text_raw: row.edited_at_text,
      pg_driver_date_iso: d instanceof Date ? d.toISOString() : d,
      api_json: JSON.stringify({ edited_at: d }),
      formatIST: formatIST(d),
    });
  }

  if (cb.rows[0]) {
    const raw = cb.rows[0].edited_at_text;
    const asUtcZ = new Date(`${raw.replace(" ", "T")}Z`);
    console.log("\n=== Latest row interpretation ===");
    console.log("edited_at_text from DB (no tz):", raw);
    console.log("Treated as UTC (+Z) -> IST:", formatIST(asUtcZ.toISOString()));
    console.log("pg driver Date -> IST:", formatIST(cb.rows[0].edited_at));
    console.log(
      "Expected IST if DB stored UTC wall clock correctly at save time",
    );
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
