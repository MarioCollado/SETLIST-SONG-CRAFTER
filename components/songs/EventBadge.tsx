'use client'

import type { Event as SongEvent, EventType } from '@/types'
import { EVENT_COLORS } from '@/types'

// ─── SVG icons ────────────────────────────────────────────────────────────────
function EventIcon({ type }: { type: EventType }) {
  const color = EVENT_COLORS[type]
  switch (type) {
    case 'cut':
      return (
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path d="M1.5 1.5l10 10M11.5 1.5l-10 10" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      )
    case 'stop':
      return (
        <svg width="13" height="13" viewBox="0 0 13 13" fill={color}>
          <rect x="1.5" y="1.5" width="10" height="10" rx="1.5" />
        </svg>
      )
    case 'hit':
      return (
        <svg width="13" height="13" viewBox="0 0 13 13" fill={color}>
          <path d="M6.5 1 8 4.8h4l-3.2 2.3 1.2 3.9L6.5 8.8 3 11l1.2-3.9L1 4.8h4z" />
        </svg>
      )
    case 'tacet':
      return (
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path d="M1.5 4.5h2.5l2-2v8l-2-2H1.5V4.5z" fill={color} opacity="0.7" />
          <path d="M9 4l3 5M9 9l3-5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )
    case 'fade':
      return (
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke={color} strokeLinecap="round">
          <path d="M1 10.5Q4 8 6.5 10.5Q9 13 12 10.5" strokeWidth="1.2" opacity="0.35" />
          <path d="M1 6.5Q4 4 6.5 6.5Q9 9 12 6.5" strokeWidth="1.4" opacity="0.65" />
          <path d="M1 2.5Q4 0 6.5 2.5Q9 5 12 2.5" strokeWidth="1.6" />
        </svg>
      )
    case 'repeat':
      return (
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 6.5A4.5 4.5 0 0111.5 6.5" />
          <path d="M11.5 4V6.5H9" />
          <path d="M11.5 6.5A4.5 4.5 0 012 6.5" />
          <path d="M2 9V6.5H4.5" />
        </svg>
      )
    case 'coda':
      return (
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round">
          <circle cx="6.5" cy="6.5" r="3.5" />
          <line x1="6.5" y1="1" x2="6.5" y2="12" />
          <line x1="1" y1="6.5" x2="12" y2="6.5" />
        </svg>
      )
    default:
      return null
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
interface EventBadgeProps {
  event: SongEvent
  compact?: boolean
  onDelete?: (id: string) => void
}

export default function EventBadge({ event, compact = false, onDelete }: EventBadgeProps) {
  const color = EVENT_COLORS[event.type]

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold uppercase tracking-wide"
      style={{ backgroundColor: `${color}1A`, color }}
    >
      <EventIcon type={event.type} />
      <span>{event.type}</span>

      {!compact && event.bar_number && (
        <span className="font-normal opacity-60 lowercase tracking-normal">
          b{event.bar_number}
          {event.beat_number ? `.${event.beat_number}` : ''}
        </span>
      )}

      {!compact && event.notes && (
        <span
          className="font-normal opacity-70 normal-case max-w-[100px] truncate"
          style={{ color: 'var(--t-sec)' }}
        >
          {event.notes}
        </span>
      )}

      {onDelete && (
        <button
          type="button"
          onClick={() => onDelete(event.id)}
          className="ml-0.5 opacity-50 hover:opacity-100 transition-opacity"
          aria-label={`Remove ${event.type}`}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </span>
  )
}
