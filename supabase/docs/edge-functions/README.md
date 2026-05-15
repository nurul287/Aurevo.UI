# Edge function references (not migrations)

These files are **reference snippets** for Deno edge functions. They are **not** applied by `supabase db push`.

To implement an edge function:

1. `supabase functions new <name>`
2. Copy logic from the `.reference` file into `supabase/functions/<name>/index.ts`
3. Deploy with `supabase functions deploy <name>`

| File | Purpose |
|------|---------|
| `guest-order-lookup.ts.reference` | Guest order lookup by token |
| `create-order.ts.reference` | Create order edge handler |
