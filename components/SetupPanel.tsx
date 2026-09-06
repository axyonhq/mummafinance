'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { CustomSelect } from '@/components/CustomSelect'
import {
  CATEGORY_OPTIONS,
  FREQUENCY_OPTIONS,
  calcFortnightlyCents,
  centsToDollarsInput,
  colorForCategory,
  dollarsToCents,
  formatAud,
  temporaryFortnightCount,
} from '@/lib/finance'
import type {
  FinanceItem,
  ItemDuration,
  PaymentFrequency,
} from '@/types/database'

type Props = {
  items: FinanceItem[]
  onCreate: (payload: {
    label: string
    category: string
    amount_cents: number
    frequency: PaymentFrequency
    duration: ItemDuration
    total_payments: number | null
    color: string
    fortnightly_cents: number
  }) => Promise<void>
  onDelete: (id: string) => Promise<void>
  busy?: boolean
}

const emptyForm = {
  label: '',
  category: 'insurance',
  amount: '',
  frequency: 'monthly' as PaymentFrequency,
  duration: 'ongoing' as ItemDuration,
  totalPayments: '4',
}

export function SetupPanel({ items, onCreate, onDelete, busy }: Props) {
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const amountCents = dollarsToCents(form.amount)
  const fortnightly = amountCents
    ? calcFortnightlyCents(amountCents, form.frequency)
    : 0
  const totalPayments =
    form.duration === 'temporary'
      ? Number.parseInt(form.totalPayments, 10)
      : null

  const preview = useMemo(() => {
    if (!amountCents || !fortnightly) return null
    const fortnightCycles =
      form.duration === 'temporary' && totalPayments && totalPayments > 0
        ? temporaryFortnightCount(form.frequency, totalPayments)
        : null
    const totalCommitment =
      form.duration === 'temporary' && totalPayments && totalPayments > 0
        ? amountCents * totalPayments
        : null
    return { fortnightCycles, totalCommitment }
  }, [amountCents, fortnightly, form.duration, form.frequency, totalPayments])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    const label = form.label.trim()
    if (!label) {
      setError('Add a label for this line item.')
      return
    }
    if (!amountCents) {
      setError('Enter a valid amount in AUD.')
      return
    }
    if (
      form.duration === 'temporary' &&
      (!totalPayments || !Number.isFinite(totalPayments) || totalPayments < 1)
    ) {
      setError('Temporary items need a total number of payments.')
      return
    }

    setSaving(true)
    try {
      await onCreate({
        label,
        category: form.category,
        amount_cents: amountCents,
        frequency: form.frequency,
        duration: form.duration,
        total_payments: form.duration === 'temporary' ? totalPayments : null,
        color: colorForCategory(form.category),
        fortnightly_cents: fortnightly,
      })
      setForm(emptyForm)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save item.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="setup panel-enter">
      <header className="section-head setup-head">
        <div>
          <p className="eyebrow">Setup</p>
          <h2>Ongoing finances</h2>
          <p>
            Add bills and commitments. Every amount locks into a fortnightly
            figure automatically.
          </p>
        </div>
      </header>

      <div className="setup-grid">
        <form className="setup-form" onSubmit={handleSubmit}>
          <div className="field">
            <label className="field-label" htmlFor="label">
              Label
            </label>
            <input
              id="label"
              name="label"
              placeholder="e.g. Car Insurance"
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              autoComplete="off"
            />
          </div>

          <CustomSelect
            label="Bucket"
            value={form.category}
            options={CATEGORY_OPTIONS.map((c) => ({
              value: c.value,
              label: c.label,
            }))}
            onChange={(category) => setForm((f) => ({ ...f, category }))}
          />

          <div className="field">
            <label className="field-label" htmlFor="amount">
              Amount (AUD)
            </label>
            <div className="money-input">
              <span aria-hidden>$</span>
              <input
                id="amount"
                name="amount"
                inputMode="decimal"
                placeholder="1000.00"
                value={form.amount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, amount: e.target.value }))
                }
              />
            </div>
          </div>

          <CustomSelect
            label="Frequency"
            value={form.frequency}
            options={FREQUENCY_OPTIONS}
            onChange={(frequency) =>
              setForm((f) => ({
                ...f,
                frequency: frequency as PaymentFrequency,
              }))
            }
          />

          <fieldset className="duration-toggle">
            <legend>Duration</legend>
            <div className="toggle-row">
              <button
                type="button"
                className={form.duration === 'ongoing' ? 'is-active' : ''}
                onClick={() => setForm((f) => ({ ...f, duration: 'ongoing' }))}
              >
                Ongoing
              </button>
              <button
                type="button"
                className={form.duration === 'temporary' ? 'is-active' : ''}
                onClick={() =>
                  setForm((f) => ({ ...f, duration: 'temporary' }))
                }
              >
                Temporary
              </button>
            </div>
          </fieldset>

          {form.duration === 'temporary' && (
            <div className="field">
              <label className="field-label" htmlFor="payments">
                Total payments
              </label>
              <input
                id="payments"
                name="payments"
                inputMode="numeric"
                min={1}
                placeholder="4"
                value={form.totalPayments}
                onChange={(e) =>
                  setForm((f) => ({ ...f, totalPayments: e.target.value }))
                }
              />
              <p className="hint">
                Auto-removes after this many {form.frequency} cycles.
              </p>
            </div>
          )}

          <div className="locked-field" aria-live="polite">
            <span className="field-label">Fortnightly (locked)</span>
            <div className="locked-value">
              <strong>{fortnightly ? formatAud(fortnightly) : '—'}</strong>
              <span>auto-calculated · read only</span>
            </div>
            {preview?.totalCommitment != null && preview.fortnightCycles != null && (
              <p className="hint preview-hint">
                {formatAud(preview.totalCommitment)} total · ≈{' '}
                {formatAud(fortnightly)} × {preview.fortnightCycles} fortnights
              </p>
            )}
          </div>

          {error && <p className="form-error">{error}</p>}

          <button
            type="submit"
            className="primary-btn"
            disabled={saving || busy}
          >
            {saving ? 'Saving…' : 'Add line item'}
          </button>
        </form>

        <div className="setup-list">
          <header className="section-head compact">
            <h3>Current line items</h3>
            <p>Synced live with Supabase.</p>
          </header>

          {items.length === 0 ? (
            <div className="empty-state soft">
              <p>Nothing saved yet — your first item will appear here.</p>
            </div>
          ) : (
            <ul className="item-table">
              {items.map((item) => (
                <li key={item.id}>
                  <div
                    className="item-swatch"
                    style={{ background: item.color }}
                    aria-hidden
                  />
                  <div className="item-main">
                    <strong>{item.label}</strong>
                    <span>
                      {formatAud(item.amount_cents)} · {item.frequency}
                      {item.duration === 'temporary'
                        ? ` · ${item.payments_remaining}/${item.total_payments} left`
                        : ' · ongoing'}
                    </span>
                  </div>
                  <div className="item-fortnight">
                    <span>Fortnightly</span>
                    <strong>{formatAud(item.fortnightly_cents)}</strong>
                    <em>locked</em>
                  </div>
                  <button
                    type="button"
                    className="ghost-btn"
                    onClick={() => onDelete(item.id)}
                    aria-label={`Delete ${item.label}`}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}

          <p className="footnote">
            Tip: monthly $1,000 becomes {formatAud(calcFortnightlyCents(100000, 'monthly'))}{' '}
            fortnightly. Four monthly payments = {formatAud(400000)} total · eight
            fortnightly slices of {formatAud(50000)}.
          </p>
        </div>
      </div>
    </section>
  )
}

export function draftAmountLabel(cents: number): string {
  return centsToDollarsInput(cents)
}
