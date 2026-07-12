require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const pool = require("../src/config/db");

async function main() {
  const before = await pool.query(
    `SELECT fields_hi->>'lede' AS lede FROM content_blocks WHERE section_key = 'dashboard-hero'`,
  );
  console.log("BEFORE:", before.rows[0]?.lede);

  await pool.query(
    `
    UPDATE content_blocks
    SET fields_hi = jsonb_set(
      COALESCE(fields_hi, '{}'::jsonb),
      '{lede}',
      to_jsonb(
        replace(
          COALESCE(fields_hi->>'lede', ''),
          'विजयapura',
          'विजयपुरा'
        )
      )
    )
    WHERE section_key = 'dashboard-hero'
    `,
  );

  // Also fix any other content_blocks / projects that may have the mixed form
  await pool.query(`
    UPDATE content_blocks
    SET fields_hi = REPLACE(fields_hi::text, 'विजयapura', 'विजयपुरा')::jsonb
    WHERE fields_hi::text LIKE '%विजयapura%'
  `);

  await pool.query(`
    UPDATE projects
    SET
      description_hi = REPLACE(COALESCE(description_hi, ''), 'विजयapura', 'विजयपुरा'),
      title_hi = REPLACE(COALESCE(title_hi, ''), 'विजयapura', 'विजयपुरा')
    WHERE COALESCE(description_hi, '') LIKE '%विजयapura%'
       OR COALESCE(title_hi, '') LIKE '%विजयapura%'
  `);

  const after = await pool.query(
    `SELECT fields_hi->>'lede' AS lede FROM content_blocks WHERE section_key = 'dashboard-hero'`,
  );
  console.log("AFTER:", after.rows[0]?.lede);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
