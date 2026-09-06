# Mumma Finance

A soft, fortnightly budgeting companion. One page. Two tabs. Everything synced to Supabase.

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
cp .env.example .env   # fill with Mumma Finance project URL + anon key
npm run dev
```

## Dashboard photo

Place your photo at `public/dashboard-photo.jpg` (convert `IMG_4401.HEIC` if needed). Until then, a soft floral SVG placeholder is shown.
