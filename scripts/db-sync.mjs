#!/usr/bin/env node
/**
 * Prod → local Postgres helpers using pg_dump / psql.
 * Install PostgreSQL client tools and ensure they are on PATH.
 *
 *   pnpm db:dump-prod
 *   pnpm db:restore-local
 *
 * Env (optional .env.local — never commit real URIs):
 *   SYNC_PROD_DATABASE_URL  — production Postgres URI (required for dump)
 *   SYNC_LOCAL_DATABASE_URL — local URI (default: postgres@127.0.0.1:54322)
 *   SYNC_DUMP_FILE          — dump path (default: supabase/manual/prod-data-snapshot.sql)
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

const ROOT = process.cwd();
const ENV_LOCAL = join(ROOT, ".env.local");

function loadOptionalEnvLocal() {
  if (!existsSync(ENV_LOCAL)) return;
  const text = readFileSync(ENV_LOCAL, "utf8");
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

function run(bin, args) {
  const r = spawnSync(bin, args, { stdio: "inherit", shell: false });
  if (r.error) {
    console.error(r.error.message);
    process.exit(1);
  }
  if (r.status !== 0) process.exit(r.status ?? 1);
}

const DUMP_DEFAULT = join(ROOT, "supabase", "manual", "prod-data-snapshot.sql");
const LOCAL_URL_DEFAULT = "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

function ensureDumpDir(filePath) {
  const dir = dirname(filePath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

/** Reject URIs with accidental spaces (common paste typo: `db.xxx yyy.supabase.co`). */
function assertNoWhitespaceInUri(url, label) {
  if (/\s/.test(url)) {
    console.error(
      `${label} contains whitespace — DNS will fail (e.g. "could not translate host name").\n` +
        `Often there is a space inside the host, like db.refpart refpart.supabase.co\n` +
        `Fix: Supabase Dashboard → Project Settings → Database → copy the URI again as one line with no spaces.`,
    );
    process.exit(1);
  }
}

const sub = process.argv[2];
loadOptionalEnvLocal();

if (sub === "dump-prod") {
  const url = process.env.SYNC_PROD_DATABASE_URL?.trim() ?? "";
  if (!url) {
    console.error(
      "Missing SYNC_PROD_DATABASE_URL.\nSet it in .env.local or the shell (Supabase Dashboard → Settings → Database → URI).",
    );
    process.exit(1);
  }
  assertNoWhitespaceInUri(url, "SYNC_PROD_DATABASE_URL");
  const out = process.env.SYNC_DUMP_FILE?.trim() || DUMP_DEFAULT;
  ensureDumpDir(out);
  run("pg_dump", [
    "--dbname",
    url,
    "--schema=public",
    "--data-only",
    "--no-owner",
    "--no-privileges",
    "-f",
    out,
  ]);
  console.log(`Wrote ${out}`);
} else if (sub === "restore-local") {
  const url = (process.env.SYNC_LOCAL_DATABASE_URL?.trim() || LOCAL_URL_DEFAULT).trim();
  assertNoWhitespaceInUri(url, "SYNC_LOCAL_DATABASE_URL");
  const file = process.env.SYNC_DUMP_FILE?.trim() || DUMP_DEFAULT;
  if (!existsSync(file)) {
    console.error(`Dump file not found: ${file}`);
    console.error(
      "Run pnpm db:dump-prod first (so the snapshot is created), or set SYNC_DUMP_FILE to the real path.",
    );
    const norm = file.replace(/\\/g, "/");
    if (norm.includes("manual-prod") && !norm.includes("/manual/prod")) {
      console.error(
        'Typo check: use folder "manual" + file name — e.g. supabase/manual/prod-data-snapshot.sql\n' +
          'Not: supabase/manual-prod-data-snapshot.sql (that is a different, wrong path).',
      );
    } else {
      console.error(`Default if unset: ${DUMP_DEFAULT}`);
    }
    process.exit(1);
  }
  run("psql", ["--dbname", url, "-v", "ON_ERROR_STOP=1", "-f", file]);
  console.log(`Restored into local database (${url.split("@").pop() ?? url})`);
} else {
  console.error("Usage: node scripts/db-sync.mjs dump-prod | restore-local");
  process.exit(1);
}
