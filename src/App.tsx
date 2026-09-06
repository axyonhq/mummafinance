import { useCallback, useEffect, useMemo, useState } from 'react'
import { Dashboard } from './components/Dashboard'
import { SetupPanel } from './components/SetupPanel'
import { buildCategoryBuckets, totalFortnightly } from './lib/finance'
import { supabase } from './lib/supabase'
import type {
  FinanceItem,
  FinanceItemInsert,
  ItemDuration,
  PaymentFrequency,
} from './types/database'
import './App.css'

type Tab = 'dashboard' | 'setup'

export default function App() {
  const [tab, setTab] = useState<Tab>('dashboard')
  const [items, setItems] = useState<FinanceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setError(null)
    setSyncing(true)
    try {
      await supabase.rpc('sync_temporary_finance_items')

      const { data, error: fetchError } = await supabase
        .from('finance_items')
        .select('*')
        .eq('is_active', true)
        .order('fortnightly_cents', { ascending: false })

      if (fetchError) throw fetchError
      setItems((data ?? []) as FinanceItem[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync finances.')
    } finally {
      setLoading(false)
      setSyncing(false)
    }
  }, [])

  useEffect(() => {
    void refresh()

    const channel = supabase
      .channel('finance_items_live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'finance_items' },
        () => {
          void refresh()
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [refresh])

  const buckets = useMemo(() => buildCategoryBuckets(items), [items])
  const total = useMemo(() => totalFortnightly(items), [items])

  async function handleCreate(payload: {
    label: string
    category: string
    amount_cents: number
    frequency: PaymentFrequency
    duration: ItemDuration
    total_payments: number | null
    color: string
    fortnightly_cents: number
  }) {
    const row: FinanceItemInsert = {
      label: payload.label,
      category: payload.category,
      amount_cents: payload.amount_cents,
      frequency: payload.frequency,
      duration: payload.duration,
      total_payments: payload.total_payments,
      payments_remaining: payload.total_payments,
      color: payload.color,
      fortnightly_cents: payload.fortnightly_cents,
      starts_on: new Date().toISOString().slice(0, 10),
    }

    const { error: insertError } = await supabase
      .from('finance_items')
      .insert(row)

    if (insertError) throw insertError
    await refresh()
    setTab('dashboard')
  }

  async function handleDelete(id: string) {
    const { error: deleteError } = await supabase
      .from('finance_items')
      .delete()
      .eq('id', id)
    if (deleteError) {
      setError(deleteError.message)
      return
    }
    await refresh()
  }

  return (
    <div className="app-shell">
      <div className="ambient" aria-hidden>
        <span className="blob blob-a" />
        <span className="blob blob-b" />
        <span className="blob blob-c" />
      </div>

      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-orb" aria-hidden />
          <div>
            <p className="brand-name">Mumma Finance</p>
            <p className="brand-sub">fortnightly clarity</p>
          </div>
        </div>

        <nav className="tabs" aria-label="Primary">
          <button
            type="button"
            className={tab === 'dashboard' ? 'is-active' : ''}
            onClick={() => setTab('dashboard')}
          >
            Dashboard
          </button>
          <button
            type="button"
            className={tab === 'setup' ? 'is-active' : ''}
            onClick={() => setTab('setup')}
          >
            Setup
          </button>
        </nav>

        <button
          type="button"
          className="sync-btn"
          onClick={() => void refresh()}
          disabled={syncing}
        >
          {syncing ? 'Syncing…' : 'Synced'}
        </button>
      </header>

      <main className="main">
        {error && (
          <div className="banner-error" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="loading-state">Gathering your pretty numbers…</div>
        ) : tab === 'dashboard' ? (
          <Dashboard totalCents={total} buckets={buckets} items={items} />
        ) : (
          <SetupPanel
            items={items}
            onCreate={handleCreate}
            onDelete={handleDelete}
            busy={syncing}
          />
        )}
      </main>
    </div>
  )
}
