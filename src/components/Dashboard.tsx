import type { CategoryBucket } from '../lib/finance'
import { formatAud, formatAudCompact } from '../lib/finance'
import type { FinanceItem } from '../types/database'

type Props = {
  totalCents: number
  buckets: CategoryBucket[]
  items: FinanceItem[]
}

export function Dashboard({ totalCents, buckets, items }: Props) {
  const activeItems = items.filter((i) => i.is_active)
  const temporaryCount = activeItems.filter((i) => i.duration === 'temporary').length

  return (
    <section className="dashboard panel-enter">
      <div className="dash-hero">
        <div className="dash-hero-copy">
          <p className="brand-mark">Mumma Finance</p>
          <h1>Your fortnightly picture</h1>
          <p className="lede">
            Everything converted to a tidy two-week rhythm — soft clarity for where
            every dollar goes.
          </p>
          <div className="total-pill">
            <span className="total-label">Total fortnightly</span>
            <strong className="total-value">{formatAud(totalCents)}</strong>
          </div>
          <div className="hero-meta">
            <span>{activeItems.length} active items</span>
            <span className="dot" aria-hidden />
            <span>{buckets.length} buckets</span>
            {temporaryCount > 0 && (
              <>
                <span className="dot" aria-hidden />
                <span>{temporaryCount} temporary</span>
              </>
            )}
          </div>
        </div>

        <figure className="dash-photo">
          <img
            src="/dashboard-photo.jpg"
            alt="Mumma Finance mood photo"
            onError={(event) => {
              const img = event.currentTarget
              if (img.dataset.fallback === '1') return
              img.dataset.fallback = '1'
              img.src = '/dashboard-photo.svg'
            }}
          />
          <figcaption>Soft focus · forever budgeting</figcaption>
        </figure>
      </div>

      <div className="dash-grid">
        <article className="breakdown-card">
          <header className="section-head">
            <h2>Allocation mix</h2>
            <p>Coloured share of your fortnightly spend by bucket.</p>
          </header>

          {buckets.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div
                className="mix-bar"
                role="img"
                aria-label="Category percentage breakdown"
              >
                {buckets.map((bucket) => (
                  <div
                    key={bucket.category}
                    className="mix-segment"
                    style={{
                      width: `${Math.max(bucket.percent, 0.8)}%`,
                      background: bucket.color,
                    }}
                    title={`${bucket.label}: ${bucket.percent.toFixed(1)}%`}
                  />
                ))}
              </div>

              <ul className="bucket-list">
                {buckets.map((bucket) => (
                  <li key={bucket.category}>
                    <div className="bucket-top">
                      <span
                        className="swatch"
                        style={{ background: bucket.color }}
                        aria-hidden
                      />
                      <div className="bucket-copy">
                        <strong>{bucket.label}</strong>
                        <span>
                          {bucket.items.length} item
                          {bucket.items.length === 1 ? '' : 's'}
                        </span>
                      </div>
                      <div className="bucket-nums">
                        <strong>{formatAudCompact(bucket.fortnightlyCents)}</strong>
                        <span>{bucket.percent.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div className="bucket-track">
                      <div
                        className="bucket-fill"
                        style={{
                          width: `${bucket.percent}%`,
                          background: bucket.color,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </article>

        <article className="allocations-card">
          <header className="section-head">
            <h2>Fortnightly allocations</h2>
            <p>Line-by-line clarity of every commitment.</p>
          </header>

          {activeItems.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="alloc-list">
              {[...activeItems]
                .sort((a, b) => b.fortnightly_cents - a.fortnightly_cents)
                .map((item) => {
                  const pct =
                    totalCents > 0
                      ? (item.fortnightly_cents / totalCents) * 100
                      : 0
                  return (
                    <li key={item.id}>
                      <div
                        className="alloc-accent"
                        style={{ background: item.color }}
                        aria-hidden
                      />
                      <div className="alloc-body">
                        <div className="alloc-title-row">
                          <strong>{item.label}</strong>
                          <span className="alloc-amount">
                            {formatAud(item.fortnightly_cents)}
                          </span>
                        </div>
                        <div className="alloc-meta">
                          <span className="chip">{item.category}</span>
                          <span className="chip soft">{item.frequency}</span>
                          {item.duration === 'temporary' ? (
                            <span className="chip warn">
                              {item.payments_remaining ?? 0}/
                              {item.total_payments ?? 0} left
                            </span>
                          ) : (
                            <span className="chip soft">ongoing</span>
                          )}
                          <span className="chip soft">{pct.toFixed(1)}%</span>
                        </div>
                      </div>
                    </li>
                  )
                })}
            </ul>
          )}
        </article>
      </div>
    </section>
  )
}

function EmptyState() {
  return (
    <div className="empty-state">
      <p>No allocations yet.</p>
      <p className="muted">Pop over to Setup and add your first line item.</p>
    </div>
  )
}
