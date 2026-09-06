import type { FinanceItem, PaymentFrequency } from '../types/database'

/** Aussie payday convention used by Mumma Finance */
export function calcFortnightlyCents(
  amountCents: number,
  frequency: PaymentFrequency,
): number {
  switch (frequency) {
    case 'daily':
      return amountCents * 14
    case 'weekly':
      return amountCents * 2
    case 'fortnightly':
      return amountCents
    case 'monthly':
      return Math.round(amountCents / 2)
    case 'annually':
      return Math.round(amountCents / 26)
  }
}

export function formatAud(cents: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
  }).format(cents / 100)
}

export function formatAudCompact(cents: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100)
}

export function dollarsToCents(value: string | number): number {
  const n = typeof value === 'number' ? value : Number.parseFloat(value)
  if (!Number.isFinite(n) || n <= 0) return 0
  return Math.round(n * 100)
}

export function centsToDollarsInput(cents: number): string {
  return (cents / 100).toFixed(2)
}

/** How many fortnightly cycles a temporary item covers */
export function temporaryFortnightCount(
  frequency: PaymentFrequency,
  totalPayments: number,
): number {
  switch (frequency) {
    case 'daily':
      return Math.ceil(totalPayments / 14)
    case 'weekly':
      return Math.ceil(totalPayments / 2)
    case 'fortnightly':
      return totalPayments
    case 'monthly':
      return totalPayments * 2
    case 'annually':
      return totalPayments * 26
  }
}

export const FREQUENCY_OPTIONS: { value: PaymentFrequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'fortnightly', label: 'Fortnightly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'annually', label: 'Annually' },
]

export const CATEGORY_OPTIONS: { value: string; label: string; color: string }[] =
  [
    { value: 'housing', label: 'Housing', color: '#E891A8' },
    { value: 'insurance', label: 'Insurance', color: '#F2B6C6' },
    { value: 'utilities', label: 'Utilities', color: '#D4A5C9' },
    { value: 'transport', label: 'Transport', color: '#F0A07A' },
    { value: 'subscriptions', label: 'Subscriptions', color: '#E8A48A' },
    { value: 'groceries', label: 'Groceries', color: '#E8A0BF' },
    { value: 'health', label: 'Health', color: '#F5C4CE' },
    { value: 'debt', label: 'Debt', color: '#D9899F' },
    { value: 'savings', label: 'Savings', color: '#E8B4BC' },
    { value: 'lifestyle', label: 'Lifestyle', color: '#F3A6B8' },
    { value: 'other', label: 'Other', color: '#E5A4B8' },
  ]

export function colorForCategory(category: string): string {
  return (
    CATEGORY_OPTIONS.find((c) => c.value === category)?.color ?? '#F4A7BB'
  )
}

export type CategoryBucket = {
  category: string
  label: string
  color: string
  fortnightlyCents: number
  percent: number
  items: FinanceItem[]
}

export function buildCategoryBuckets(items: FinanceItem[]): CategoryBucket[] {
  const active = items.filter((i) => i.is_active)
  const total = active.reduce((sum, i) => sum + i.fortnightly_cents, 0)
  const map = new Map<string, FinanceItem[]>()

  for (const item of active) {
    const key = item.category || 'other'
    const list = map.get(key) ?? []
    list.push(item)
    map.set(key, list)
  }

  return [...map.entries()]
    .map(([category, group]) => {
      const fortnightlyCents = group.reduce(
        (sum, i) => sum + i.fortnightly_cents,
        0,
      )
      const meta = CATEGORY_OPTIONS.find((c) => c.value === category)
      return {
        category,
        label: meta?.label ?? category,
        color: meta?.color ?? group[0]?.color ?? '#F4A7BB',
        fortnightlyCents,
        percent: total > 0 ? (fortnightlyCents / total) * 100 : 0,
        items: group.sort((a, b) => b.fortnightly_cents - a.fortnightly_cents),
      }
    })
    .sort((a, b) => b.fortnightlyCents - a.fortnightlyCents)
}

export function totalFortnightly(items: FinanceItem[]): number {
  return items
    .filter((i) => i.is_active)
    .reduce((sum, i) => sum + i.fortnightly_cents, 0)
}
