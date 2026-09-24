'use client'

import type { SectionWithEvents } from '@/types'
import { SECTION_COLORS } from '@/types'
import EventBadge from './EventBadge'

interface SectionCardProps {
  section: SectionWithEvents
  index: number
  total: number
  onEdit: (section: SectionWithEvents) => void
  onDelete: (id: string) => void
  onMoveUp: (id: string) => void
  onMoveDown: (id: string) => void
  onDeleteEvent: (eventId: string) => void
  onAddEvent: (sectionId: string) => void
}

export default function SectionCard({
  section,
  index,
  total,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  onDeleteEvent,
  onAddEvent,
}: SectionCardProps) {
  const color = SECTION_COLORS[section.type]
  const displayName = section.label || section.type.toUpperCase()

  return (
    <div className="card flex overflow-hidden animate-fade-in">
      {/* Left color bar */}
      <div className="w-1 flex-shrink-0" style={{ backgroundColor: color }} />

      {/* Main content */}
      <div className="flex-1 p-3 min-w-0">
        {/* Header */}
        <div className="flex items-start gap-2">
          {/* Number badge */}
          <span
            className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
            style={{ backgroundColor: `${color}2A`, color }}
          >
            {index + 1}
          </span>

          {/* Name + meta */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold uppercase tracking-wide leading-tight" style={{ color }}>
              {displayName}
            </p>
            <p className="text-xs text-[var(--t-dim)] mt-0.5">
              Bars {section.bar_start}–{section.bar_end}
              {section.bpm_override && (
                <>
                  {' · '}
                  <span className="text-[var(--t-sec)]">{section.bpm_override} BPM</span>
                </>
              )}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center flex-shrink-0 -mr-1">
            <button
              onClick={() => onMoveUp(section.id)}
              disabled={index === 0}
              className="btn-ghost w-8 h-8 min-h-0 min-w-0 disabled:opacity-20"
              aria-label="Move up"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6.5 10.5V2.5M2.5 6.5l4-4 4 4" />
              </svg>
            </button>
            <button
              onClick={() => onMoveDown(section.id)}
              disabled={index === total - 1}
              className="btn-ghost w-8 h-8 min-h-0 min-w-0 disabled:opacity-20"
              aria-label="Move down"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6.5 2.5v8M2.5 6.5l4 4 4-4" />
              </svg>
            </button>
            <button
              onClick={() => onEdit(section)}
              className="btn-ghost w-8 h-8 min-h-0 min-w-0"
              aria-label="Edit section"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.5 1.5l2 2-7 7H2.5v-2l7-7z" />
              </svg>
            </button>
            <button
              onClick={() => {
                if (confirm('Delete this section and all its cues?')) onDelete(section.id)
              }}
              className="btn-danger w-8 h-8 min-h-0 min-w-0"
              aria-label="Delete section"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M1.5 1.5l10 10M11.5 1.5l-10 10" />
              </svg>
            </button>
          </div>
        </div>

        {/* Rhythm / notes */}
        {(section.rhythm_notes || section.notes) && (
          <p className="text-xs text-[var(--t-sec)] mt-2 leading-relaxed pl-9">
            {section.rhythm_notes && (
              <span className="text-[var(--t-dim)] mr-1">{section.rhythm_notes} ·</span>
            )}
            {section.notes}
          </p>
        )}

        {/* Events */}
        <div className="mt-2.5 pl-9 flex flex-wrap gap-1.5">
          {section.events.map((ev) => (
            <EventBadge key={ev.id} event={ev} onDelete={onDeleteEvent} />
          ))}
          <button
            type="button"
            onClick={() => onAddEvent(section.id)}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs
                       text-[var(--t-dim)] hover:text-[var(--t-sec)] hover:bg-[var(--s3)]
                       transition-colors"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M5 1v8M1 5h8" />
            </svg>
            Add cue
          </button>
        </div>
      </div>
    </div>
  )
}
