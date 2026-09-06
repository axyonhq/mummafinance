# Mumma Finance

A soft, fortnightly budgeting companion built with Next.js. One page. Two tabs. Everything synced to Supabase.

## Features

- **Dashboard** — total fortnightly spend, coloured bucket mix, and line-by-line allocations
- **Setup** — add ongoing or temporary line items with custom dropdowns
- **Auto fortnightly lock** — any frequency converts to a read-only fortnightly AUD amount
- **Temporary items** — auto-delete after the configured number of payment cycles
- **Live sync** — reads/writes `finance_items` in the Mumma Finance Supabase project

## Fortnightly conversion

| Frequency    | Formula      |
|--------------|--------------|
| Daily        | × 14         |
| Weekly       | × 2          |
| Fortnightly  | × 1          |
| Monthly      | ÷ 2          |
| Annually     | ÷ 26         |

Example: monthly `$1,000` → `$500` fortnightly. Four monthly payments = `$4,000` total → eight fortnightly slices.

## Develop

```bash
npm install
cp .env.example .env.local   # fill NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

## Dashboard photo

`public/dashboard-photo.jpg` is converted from `IMG_4401.HEIC` and shown in the dashboard hero. A soft floral SVG remains as fallback.


## Vercel

Set these **Production** (and Preview) environment variables, then **redeploy**:

- `NEXT_PUBLIC_SUPABASE_URL` — Mumma Finance project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — project anon/public key

Find both in Supabase → Project Settings → API.

`NEXT_PUBLIC_*` values are inlined at build time, so a redeploy is required after changing them.
