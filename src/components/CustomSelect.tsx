import { useEffect, useId, useRef, useState } from 'react'

type Option = { value: string; label: string }

type Props = {
  label: string
  value: string
  options: Option[]
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export function CustomSelect({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select…',
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()
  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <div className={`field custom-select ${open ? 'is-open' : ''}`} ref={rootRef}>
      <span className="field-label">{label}</span>
      <button
        type="button"
        className="select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={selected ? '' : 'is-placeholder'}>
          {selected?.label ?? placeholder}
        </span>
        <span className="select-chevron" aria-hidden>
          <svg viewBox="0 0 20 20" width="16" height="16">
            <path
              d="M5.5 7.5 10 12l4.5-4.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
      {open && (
        <ul className="select-menu" role="listbox" id={listId}>
          {options.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                role="option"
                aria-selected={option.value === value}
                className={option.value === value ? 'is-selected' : ''}
                onClick={() => {
                  onChange(option.value)
                  setOpen(false)
                }}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
