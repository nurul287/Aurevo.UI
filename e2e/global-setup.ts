import postgres from "postgres";

/**
 * Tops up stock on every variant before the run so repeated test runs never
 * exhaust real catalog stock — the specs place real orders against whatever
 * product the API returns first, and each order permanently decrements it.
 *
 * Hardcoded fallback is the well-known local Supabase Docker connection
 * string (same default used throughout Aurevo.BE) — never point this at a
 * remote/production database.
 */
const DATABASE_URL =
  process.env.E2E_DATABASE_URL ??
  "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

const FLOOR_STOCK = 1000;

export default async function globalSetup() {
  if (!DATABASE_URL.includes("127.0.0.1") && !DATABASE_URL.includes("localhost")) {
    throw new Error(
      `Refusing to run e2e global-setup against a non-local database: ${DATABASE_URL}`,
    );
  }

  const sql = postgres(DATABASE_URL, { max: 1 });
  try {
    await sql`
      UPDATE product_variants
      SET stock = ${FLOOR_STOCK}
      WHERE is_active = true AND stock < ${FLOOR_STOCK}
    `;
    await sql`
      UPDATE inventory
      SET quantity = ${FLOOR_STOCK}, reserved_quantity = 0
      WHERE quantity < ${FLOOR_STOCK}
    `;
  } finally {
    await sql.end();
  }
}
