# Aurevo database (Supabase)

Schema, RLS, storage policies, and RPCs are versioned in **`migrations/`**.  
The app (`src/`) reads/writes via `@supabase/supabase-js`; this folder is the **source of truth** for Postgres.

## Rules

1. **Never** change production schema only in the Supabase SQL Editor.
2. Add a new file: `supabase/migrations/NNN_short_description.sql` (next number after `026`).
3. Test locally: `pnpm db:reset` (requires Docker).
4. Open a PR — CI runs `pnpm db:validate`.
5. After merge to `main`, CI applies pending migrations with `supabase db push` (when GitHub secrets are set).

Non-migration SQL/snippets go in `manual/` or `docs/`, not `migrations/`.

## First-time setup (developer)

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for local Supabase)
- **Supabase CLI** — all `pnpm db:*` scripts use `pnpm dlx supabase@2.98.2`, which downloads the official CLI on first run (no global install required).

### 1. Link to the remote project (one time per machine)

Create a [personal access token](https://supabase.com/dashboard/account/tokens), then:

```bash
export SUPABASE_ACCESS_TOKEN=your_token   # Windows: set in env or use GitHub secrets locally
pnpm db:link
# Enter project ref when prompted (Dashboard → Project Settings → General)
```

This writes `supabase/.temp/` (gitignored). Do not commit tokens.

### 2. Local database

```bash
pnpm db:start    # first run downloads images
pnpm db:reset    # applies all migrations + seed.sql
pnpm db:types:local
```

Local URLs are printed by `pnpm db:status`. Point `.env.local` at local keys if you want the UI against local Supabase.

### 3. App env (remote dev / production UI)

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

## Scripts (from repo root)

| Command | Purpose |
|---------|---------|
| `pnpm db:validate` | Check migration file names and layout |
| `pnpm db:start` | Start local Supabase stack |
| `pnpm db:stop` | Stop local stack |
| `pnpm db:reset` | Reapply all migrations + seed (local only) |
| `pnpm db:status` | Show local URLs and keys |
| `pnpm db:push` | Apply pending migrations to **linked** remote project |
| `pnpm db:diff -f name` | Generate migration from local schema drift |
| `pnpm db:types` | Generate TypeScript types from **linked** remote |
| `pnpm db:types:local` | Generate types from **local** DB |
| `pnpm db:link` | Link CLI to a Supabase project |
| `pnpm db:migration:list` | Show applied vs pending migrations |

## CI / GitHub Actions

Workflow: `.github/workflows/database.yml`

**On every PR** (when `supabase/` changes): validate migrations.

**On push to `main`** (when `supabase/` changes): `supabase db push` to the linked project.

### Required repository secrets

| Secret | Description |
|--------|-------------|
| `SUPABASE_ACCESS_TOKEN` | Personal access token with project access |
| `SUPABASE_DB_PROJECT_ID` | Project ref (e.g. `bwcbcmeftplyljgcacvr`) |

Optional: use GitHub **Environments** (`staging`, `production`) with different `SUPABASE_DB_PROJECT_ID` per environment.

## Existing remote already has schema?

If migrations were applied manually before the CLI workflow, **baseline** the history once:

```bash
pnpm db:link
pnpm db:migration:list
# Mark each existing migration as applied (example for 001):
supabase migration repair --status applied 001
# Repeat for 002 … 026, or script it after verifying remote matches files.
```

Then use only new numbered migrations + `db push` going forward.

## Environments (recommended)

| Environment | Supabase project | Apply migrations |
|-------------|------------------|----------------|
| Local | `supabase start` | `db reset` |
| Staging | Separate project (optional) | `db push` on `dev` branch (optional) |
| Production | Main project | `db push` on `main` via CI |

Keep **project IDs and keys** in team password manager / GitHub secrets — not in git.

## Folder layout

```
supabase/
  config.toml          # CLI config (local ports, Postgres 17)
  migrations/          # Versioned SQL only (*.sql)
  seed.sql             # Dev seed after reset (optional rows)
  manual/              # One-off ops scripts (not auto-applied)
  docs/                # References (edge functions, notes)
  memory-bank/         # Historical notes (not applied by CLI)
```

## Copy production data + images into local Docker

Goal: local Postgres rows + images usable from the app (either still served from prod URLs or copied to local Storage).

### 1. Schema on local first

```bash
pnpm db:start
pnpm db:reset
```

### 2. Postgres data (products, variants, orders, …)

**Option A — `pg_dump` / `psql`**

1. Production: **Dashboard → Project Settings → Database** → copy the connection **URI** (you need the database password).
2. Dump **data only** for `public` (tune flags / table list if the dump is huge or hits FK order issues):

```bash
pg_dump "<PRODUCTION_POSTGRES_URI>" \
  --schema=public --data-only --no-owner --no-privileges \
  -f supabase/manual/prod-data-snapshot.sql
```

3. Import into **local** Postgres (default local password is often `postgres`; confirm with `pnpm db:status` / Studio):

```bash
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -f supabase/manual/prod-data-snapshot.sql
```

**Notes**

- Prefer **not** copying `auth.users` from prod; use local sign-ups for login, or only dump tables under `public` that you need.
- If restore fails on FK order, use a superuser session with `--disable-triggers` for restore only, or split dumps by table.

**Option B — CLI (linked to prod)**

```bash
pnpm db:link
pnpm dlx supabase@2.98.2 db dump --help   # check --data-only / --linked flags for your version
```

**Option C — `pnpm` scripts (same as Option A, env-driven)**

Requires **PostgreSQL client tools** (`pg_dump`, `psql`) on your `PATH`.

1. Add **`SYNC_PROD_DATABASE_URL`** to `.env.local` (see `env.example`). Never commit it.
2. `pnpm db:dump-prod` → writes `supabase/manual/prod-data-snapshot.sql` (or `SYNC_DUMP_FILE`).
3. `pnpm db:restore-local` → loads that file into local Postgres (`SYNC_LOCAL_DATABASE_URL` defaults to `postgresql://postgres:postgres@127.0.0.1:54322/postgres`).

### 3. Images (S3 / Supabase Storage)

**If images are in Supabase Storage**

- After restoring rows, URLs in the DB usually still point at **production** (`https://<prod-ref>.supabase.co/storage/...`). Often they **still load in the browser** during local dev (simplest option).
- For **fully local** files: download objects from the prod bucket (service role), upload the same paths to the **local** `product-images` bucket, then `UPDATE` URLs on local to use `http://127.0.0.1:54321` (or run a small script).

**If images are in a separate AWS S3 bucket**

- `aws s3 sync s3://bucket/prefix ./backup-images/` then upload into local Supabase Storage **or** keep DB URLs pointing at S3 if they are public HTTPS URLs you are OK hitting from dev.

### 4. Check

- Local Studio: `http://127.0.0.1:54323` — tables and `product_images` URLs.
- App with **local** `.env.local` — open a product and confirm images.

### 5. Safety

- Put dumps under `supabase/manual/` with a **`prod-` prefix** (ignored by git via `supabase/manual/prod-*.sql`).
- Never commit **service role** keys or production connection strings.

## Dangerous migrations

- `015_wipe_ecommerce_data.sql` — destructive; never run on production without explicit intent.
