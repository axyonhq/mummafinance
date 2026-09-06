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

## Live sync across devices

Changes save to Supabase immediately. Any other open phone or computer receives them over Supabase Realtime, and the app also refreshes when you return to the tab or reconnect.

## Mobile

The layout collapses to a single column under 920px with a sticky bottom tab bar, larger tap targets, and safe-area padding for notched phones.
