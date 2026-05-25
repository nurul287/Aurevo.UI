# Meta Conversions API (Supabase Edge Function)

Server-side **Purchase** events for dataset **Aurevo Fashion**, deduped with the browser pixel via the same `event_id` (order UUID).

## Architecture

```
orders INSERT → Database Webhook (POST) → Edge Function meta-conversions
                                              ↓
                                    Meta Graph API /events
```

Browser pixel (`VITE_META_PIXEL_ID`) continues to fire Purchase on the confirmation page with the same `event_id`.

## 1. Meta: access token

1. [Events Manager](https://business.facebook.com/events_manager2) → **Aurevo Fashion** → **Settings**.
2. **Conversions API** → **Set up manually** → **Generate access token**.
3. Copy the token (store securely; do not commit).

Optional: **Test events** tab → copy **Test event code** (e.g. `TEST63329`) for staging only.

## 2. Supabase secrets

Dashboard → **Project Settings** → **Edge Functions** → **Secrets** (or CLI below).

| Secret                       | Value                                             |
| ---------------------------- | ------------------------------------------------- |
| `META_PIXEL_ID`              | `1409609890385063` (same as `VITE_META_PIXEL_ID`) |
| `META_CONVERSIONS_API_TOKEN` | Token from step 1                                 |
| `META_TEST_EVENT_CODE`       | Optional; remove in production when done testing  |
| `META_SITE_URL`              | Optional; default `https://aurevofashion.store`   |

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided automatically to Edge Functions.

CLI:

```bash
supabase secrets set META_PIXEL_ID=1409609890385063
supabase secrets set META_CONVERSIONS_API_TOKEN=your_token_here
# supabase secrets set META_TEST_EVENT_CODE=TEST63329
```

## 3. Deploy function + migration

**Production (automatic):** merge to `main` with changes under `supabase/`. GitHub Actions (`.github/workflows/database.yml`) runs `db push` then `supabase functions deploy`.

**Manual:**

```bash
pnpm db:push                    # applies 032_meta_capi_sent.sql
pnpm db:functions:deploy        # deploy meta-conversions only
# or: supabase functions deploy  # all functions
```

## 4. Database webhook (required)

Dashboard → **Database** → **Webhooks** → **Create a new hook**

| Field         | Value                                    |
| ------------- | ---------------------------------------- |
| Name          | `meta-conversions-purchase`              |
| Table         | `orders`                                 |
| Events        | **Insert** only                          |
| Type          | Supabase Edge Functions                  |
| Edge Function | `meta-conversions`                       |
| HTTP method   | POST                                     |
| Headers       | Use default (includes service role auth) |

For **local** Docker stack, webhook URL must use `host.docker.internal` (see [Supabase webhooks](https://supabase.com/docs/guides/database/webhooks)).

## 5. Test

1. Set `META_TEST_EVENT_CODE` in secrets.
2. Place a test order on the site (or insert a test row in `orders` locally).
3. **Events Manager** → **Test events** → look for **Purchase** with source **Server** (or Browser + Server with same event id).
4. Remove `META_TEST_EVENT_CODE` before relying on live ad optimization data.

Manual invoke (service role JWT):

```bash
curl -X POST "https://YOUR_PROJECT.supabase.co/functions/v1/meta-conversions" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"order_id":"ORDER_UUID_HERE"}'
```

## 6. Verify deduplication

- Pixel: `eventID` = order id (`src/lib/meta-pixel/client.ts`).
- CAPI: `event_id` = same order id.
- Table `meta_capi_sent` prevents duplicate server sends on webhook retry.

## Troubleshooting

| Issue                       | Check                                                             |
| --------------------------- | ----------------------------------------------------------------- |
| No server events            | Webhook exists on `orders` INSERT; function deployed; secrets set |
| 401 on function             | Webhook must use service role / Edge Function integration         |
| Meta API error in logs      | Token scope, pixel id, `META_TEST_EVENT_CODE` validity            |
| Duplicate purchases in Meta | Same `event_id` on browser + server is OK; Meta dedupes           |

Function logs: Dashboard → **Edge Functions** → `meta-conversions` → **Logs**.
