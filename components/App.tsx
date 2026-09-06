'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { Dashboard } from '@/components/Dashboard'
import { SetupPanel } from '@/components/SetupPanel'
import { errorMessage } from '@/lib/errors'
import { buildCategoryBuckets, totalFortnightly } from '@/lib/finance'
import { hasSupabaseConfig, supabase } from '@/lib/supabase'
import type {
  FinanceItem,
  FinanceItemInsert,
  ItemDuration,
  PaymentFrequency,
} from '@/types/database'
import './App.css'

type Tab = 'dashboard' | 'setup'
type SyncState = 'connecting' | 'live' | 'syncing' | 'offline'

export default function App() {
  const [tab, setTab] = useState<Tab>('dashboard')
  const [items, setItems] = useState<FinanceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [syncState, setSyncState] = useState<SyncState>('connecting')
  const [error, setError] = useState<string | null>(null)
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)

  const refresh = useCallback(async (reason: 'manual' | 'realtime' | 'focus' = 'manual') => {
    setError(null)
    if (reason !== 'realtime') setSyncState('syncing')

    try {
      if (!hasSupabaseConfig()) {
        throw new Error(
          'Supabase env vars are missing on Vercel. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then redeploy.',
        )
      }

      await supabase.rpc('sync_temporary_finance_items')

      const { data, error: fetchError } = await supabase
        .from('finance_items')
        .select('*')
        .eq('is_active', true)
        .order('fortnightly_cents', { ascending: false })

      if (fetchError) throw fetchError
      setItems((data ?? []) as FinanceItem[])
      setSyncState((prev) => (prev === 'offline' ? 'connecting' : 'live'))
    } catch (err) {
      setError(
        hasSupabaseConfig()
          ? errorMessage(err, 'Failed to sync finances.')
          : 'Supabase env vars are missing on Vercel. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then redeploy.',
      )
      setSyncState('offline')
    } finally {
      setLoading(false)
    }
  }, [])

  const scheduleRefresh = useCallback(
    (reason: 'realtime' | 'focus' = 'realtime') => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current)
      refreshTimer.current = setTimeout(() => {
        void refresh(reason)
      }, reason === 'realtime' ? 180 : 0)
    },
    [refresh],
  )

  useEffect(() => {
    void refresh('manual')

    const channel = supabase
      .channel(`finance_items_live_${crypto.randomUUID()}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'finance_items' },
        () => {
          scheduleRefresh('realtime')
        },
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setSyncState('live')
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setSyncState('offline')
          scheduleRefresh('focus')
        } else if (status === 'CLOSED') {
          setSyncState((prev) => (prev === 'syncing' ? prev : 'connecting'))
        }
      })

    channelRef.current = channel

    const onVisible = () => {
      if (document.visibilityState === 'visible') scheduleRefresh('focus')
    }
    const onOnline = () => {
      setSyncState('connecting')
      scheduleRefresh('focus')
    }
    const onOffline = () => setSyncState('offline')

    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)

    return () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
      if (channelRef.current) {
        void supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [refresh, scheduleRefresh])

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
    await refresh('manual')
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
    await refresh('manual')
  }

  const syncLabel =
    syncState === 'live'
      ? 'Live'
      : syncState === 'syncing'
        ? 'Syncing…'
        : syncState === 'connecting'
          ? 'Connecting…'
          : 'Offline'

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
          className={`sync-btn is-${syncState}`}
          onClick={() => void refresh('manual')}
          disabled={syncState === 'syncing'}
          title="Refresh from Supabase"
        >
          <span className="sync-dot" aria-hidden />
          {syncLabel}
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
            busy={syncState === 'syncing'}
          />
        )}
      </main>

      <nav className="mobile-tabs" aria-label="Mobile primary">
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
    </div>
  )
}
