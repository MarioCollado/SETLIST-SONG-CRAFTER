'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import type {
  SetlistWithSongs,
  ZoomLevel,
  EventType,
  SectionWithEvents,
  Event as SongEvent,
} from '@/types'
import { SECTION_COLORS, EVENT_COLORS } from '@/types'

// ─── Inline Monochromatic Event Icons ─────────────────────────────────────────
function EventIcon({ type }: { type: EventType }) {
  const color = EVENT_COLORS[type]
  switch (type) {
    case 'cut':
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M1.5 1.5l9 9M10.5 1.5l-9 9" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      )
    case 'stop':
      return (
        <svg width="11" height="11" viewBox="0 0 11 11" fill={color}>
          <rect width="11" height="11" rx="1.5" />
        </svg>
      )
    case 'hit':
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill={color}>
          <path d="M6 0.5l1.6 3.6 3.9.4-2.9 2.6.8 3.9L6 9 2.6 11l.8-3.9-2.9-2.6 3.9-.4z" />
        </svg>
      )
    case 'tacet':
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M1.5 4h2l2-2v8l-2-2h-2V4z" fill={color} opacity="0.8" />
          <path d="M8 4l3 4M8 8l3-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )
    case 'fade':
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke={color} strokeLinecap="round">
          <path d="M1 9.5Q3.5 7.5 6 9.5Q8.5 11.5 11 9.5" strokeWidth="1.1" opacity="0.4" />
          <path d="M1 6Q3.5 4 6 6Q8.5 8 11 6" strokeWidth="1.3" opacity="0.7" />
          <path d="M1 2.5Q3.5 0.5 6 2.5Q8.5 4.5 11 2.5" strokeWidth="1.6" />
        </svg>
      )
    case 'repeat':
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 6A4 4 0 0110 6" />
          <path d="M10 4V6H8" />
          <path d="M10 6A4 4 0 012 6" />
          <path d="M2 8V6H4" />
        </svg>
      )
    case 'coda':
      return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
          <circle cx="6" cy="6" r="3.5" />
          <line x1="6" y1="1" x2="6" y2="11" />
          <line x1="1" y1="6" x2="11" y2="6" />
        </svg>
      )
    default:
      return null
  }
}

interface PerformanceViewProps {
  setlist: SetlistWithSongs
}

export default function PerformanceView({ setlist }: PerformanceViewProps) {
  const songs = setlist.setlist_songs
  const [currentIndex, setCurrentIndex] = useState(0)
  const [zoom, setZoom] = useState<ZoomLevel>('MEDIUM')
  const [showDrawer, setShowDrawer] = useState(false)
  const [wakeLockActive, setWakeLockActive] = useState(false)

  // Current song item
  const currentSetlistSong = songs[currentIndex]
  const currentSong = currentSetlistSong?.song

  // Keep screen awake (WakeLock API)
  useEffect(() => {
    let wakeLock: any = null
    async function requestWakeLock() {
      if ('wakeLock' in navigator) {
        try {
          wakeLock = await (navigator as any).wakeLock.request('screen')
          setWakeLockActive(true)
        } catch {
          setWakeLockActive(false)
        }
      }
    }
    requestWakeLock()

    return () => {
      if (wakeLock) wakeLock.release().catch(() => {})
    }
  }, [])

  // Navigation handlers
  const handlePrev = useCallback(() => {
    setCurrentIndex((i) => (i > 0 ? i - 1 : i))
  }, [])

  const handleNext = useCallback(() => {
    setCurrentIndex((i) => (i < songs.length - 1 ? i + 1 : i))
  }, [songs.length])

  // Cycle zoom: MEDIUM -> FULL -> MINIMAL -> MEDIUM
  const cycleZoom = () => {
    setZoom((z) => {
      if (z === 'MEDIUM') return 'FULL'
      if (z === 'FULL') return 'MINIMAL'
      return 'MEDIUM'
    })
  }

  // Keyboard navigation (Bluetooth pedals / arrow keys / space)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault()
        handleNext()
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault()
        handlePrev()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleNext, handlePrev])

  // Progress bar calculation
  const progressSegments = useMemo(() => {
    if (!currentSong?.sections || currentSong.sections.length === 0) return []
    const totalBars = currentSong.sections.reduce(
      (sum, s) => sum + Math.max(1, s.bar_end - s.bar_start + 1),
      0
    )
    return currentSong.sections.map((s) => {
      const bars = Math.max(1, s.bar_end - s.bar_start + 1)
      const pct = (bars / totalBars) * 100
      return {
        id: s.id,
        color: SECTION_COLORS[s.type] || '#5A6470',
        pct: Math.max(pct, 2), // minimum visible tick
      }
    })
  }, [currentSong?.sections])

  if (!currentSong) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center p-6 text-center bg-[var(--bg)]">
        <p className="text-xl font-bold text-[var(--t-pri)] mb-2">No songs in this setlist</p>
        <p className="text-sm text-[var(--t-dim)] mb-6">
          Add songs to &ldquo;{setlist.title}&rdquo; to start performance mode.
        </p>
        <Link href={`/setlists/${setlist.id}`} className="btn-primary px-6 py-2 text-sm">
          Return to Setlist
        </Link>
      </div>
    )
  }

  return (
    <div className="flex h-dvh flex-col bg-[var(--bg)] text-[var(--t-pri)] overscroll-none select-none overflow-hidden">
      {/* ─── HEADER ───────────────────────────────────────────────────────────── */}
      <header className="flex h-12 flex-shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--s1)] px-3">
        {/* Menu / Song picker button */}
        <button
          onClick={() => setShowDrawer(true)}
          className="btn-ghost w-10 h-10 min-h-0 min-w-0"
          aria-label="Setlist menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M3 5h14a1 1 0 100-2H3a1 1 0 000 2zm0 6h14a1 1 0 100-2H3a1 1 0 000 2zm0 6h14a1 1 0 100-2H3a1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Center label */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--t-sec)]">
            PERFORMANCE MODE
          </span>
          {wakeLockActive && (
            <span
              className="w-1.5 h-1.5 rounded-full bg-emerald-500"
              title="Screen WakeLock Active"
            />
          )}
        </div>

        {/* Exit back to setlist */}
        <Link
          href={`/setlists/${setlist.id}`}
          className="btn-ghost w-10 h-10 min-h-0 min-w-0 text-[var(--t-sec)]"
          aria-label="Exit performance mode"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="14" y1="4" x2="4" y2="14" />
            <line x1="4" y1="4" x2="14" y2="14" />
          </svg>
        </Link>
      </header>

      {/* ─── SONG INFO ────────────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-[var(--s2)] px-4 pt-3 pb-2.5 border-b border-[var(--border)]">
        <div className="flex items-baseline justify-between gap-2">
          <h1 className="text-[22px] font-extrabold leading-tight text-[var(--t-pri)] truncate">
            {currentSong.title}
          </h1>
          <span className="text-xs font-mono font-bold text-[var(--t-dim)] flex-shrink-0">
            {currentIndex + 1 < 10 ? `0${currentIndex + 1}` : currentIndex + 1}/{songs.length < 10 ? `0${songs.length}` : songs.length}
          </span>
        </div>

        {/* BPM · KEY · TIME SIG in row */}
        <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-[var(--t-sec)]">
          {currentSong.bpm_default ? (
            <span className="text-white font-bold">{currentSong.bpm_default} BPM</span>
          ) : (
            <span className="text-[var(--t-dim)]">NO BPM</span>
          )}
          <span className="text-[var(--t-dim)]">•</span>
          {currentSong.key ? (
            <span className="text-amber-400 font-bold">{currentSong.key}</span>
          ) : (
            <span className="text-[var(--t-dim)]">NO KEY</span>
          )}
          <span className="text-[var(--t-dim)]">•</span>
          <span className="text-[var(--t-sec)]">{currentSong.time_signature || '4/4'}</span>
          {currentSong.genre && (
            <>
              <span className="text-[var(--t-dim)]">•</span>
              <span className="text-[var(--t-dim)] font-normal truncate max-w-[120px]">{currentSong.genre}</span>
            </>
          )}
        </div>

        {/* Live override note for this gig if set */}
        {currentSetlistSong.override_notes && (
          <div className="mt-2 rounded bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 text-xs text-amber-200">
            <span className="font-bold mr-1.5 uppercase text-[10px]">CUE:</span>
            {currentSetlistSong.override_notes}
          </div>
        )}
      </div>

      {/* ─── PROGRESS BAR ─────────────────────────────────────────────────────── */}
      <div className="flex h-1 w-full bg-[var(--s3)] overflow-hidden flex-shrink-0">
        {progressSegments.map((seg, idx) => (
          <div
            key={seg.id || idx}
            style={{
              width: `${seg.pct}%`,
              backgroundColor: seg.color,
            }}
            className="h-full border-r border-black/40 last:border-0"
          />
        ))}
      </div>

      {/* ─── SECTION LIST (SCROLLABLE ROADMAP) ─────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto p-3 space-y-2 overscroll-none">
        {(!currentSong.sections || currentSong.sections.length === 0) ? (
          <div className="text-center py-16 text-sm text-[var(--t-dim)]">
            No sections defined for this song.
          </div>
        ) : (
          currentSong.sections.map((section: SectionWithEvents, idx: number) => {
            const color = SECTION_COLORS[section.type] || '#5A6470'
            const label = section.label || section.type.toUpperCase()
            const hasBpmOverride =
              section.bpm_override && section.bpm_override !== currentSong.bpm_default

            // ── MINIMAL ZOOM LEVEL ──────────────────────────────────────────
            if (zoom === 'MINIMAL') {
              return (
                <div
                  key={section.id}
                  className="flex items-center gap-2.5 rounded-lg border border-[var(--border)] bg-[var(--s2)] px-2.5 py-1.5 overflow-hidden"
                >
                  <div className="w-1.5 h-6 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                    style={{ backgroundColor: `${color}33`, color }}
                  >
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wide truncate flex-1" style={{ color }}>
                    {label}
                  </span>
                  <span className="text-[11px] font-mono text-[var(--t-dim)] flex-shrink-0">
                    {section.bar_start}–{section.bar_end}
                  </span>
                  {section.events && section.events.length > 0 && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {section.events.slice(0, 3).map((ev: SongEvent) => (
                        <span key={ev.id} title={ev.type}>
                          <EventIcon type={ev.type} />
                        </span>
                      ))}
                    </div>
                  )}
                  {hasBpmOverride && (
                    <span className="text-[10px] font-bold text-amber-400 font-mono">
                      {section.bpm_override}
                    </span>
                  )}
                </div>
              )
            }

            // ── MEDIUM / FULL ZOOM LEVEL ────────────────────────────────────
            return (
              <div
                key={section.id}
                className="card flex overflow-hidden border border-[var(--border)] bg-[var(--s2)]"
              >
                {/* Lateral color bar */}
                <div className="w-1.5 flex-shrink-0 self-stretch" style={{ backgroundColor: color }} />

                <div className="flex-1 p-3 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    {/* Number + Section Name */}
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: `${color}33`, color }}
                      >
                        {idx + 1}
                      </span>
                      <span
                        className="text-sm font-extrabold uppercase tracking-wide truncate"
                        style={{ color }}
                      >
                        {label}
                      </span>
                    </div>

                    {/* Bars & BPM */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {hasBpmOverride && (
                        <span className="text-xs font-bold font-mono text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                          {section.bpm_override} BPM
                        </span>
                      )}
                      <span className="text-xs font-mono text-[var(--t-sec)]">
                        b.{section.bar_start}–{section.bar_end}
                      </span>
                    </div>
                  </div>

                  {/* Rhythm notes / section notes */}
                  {(section.rhythm_notes || (zoom === 'FULL' && section.notes)) && (
                    <div className="mt-1.5 text-xs text-[var(--t-sec)] pl-8">
                      {section.rhythm_notes && (
                        <span className="font-semibold text-[var(--t-pri)] mr-1">
                          {section.rhythm_notes}
                        </span>
                      )}
                      {zoom === 'FULL' && section.notes && (
                        <span className="text-[var(--t-dim)] italic">({section.notes})</span>
                      )}
                    </div>
                  )}

                  {/* Cues / Events list */}
                  {section.events && section.events.length > 0 && (
                    <div className="mt-2 pl-8 flex flex-wrap gap-1.5">
                      {section.events.map((ev: SongEvent) => {
                        const evColor = EVENT_COLORS[ev.type]
                        return (
                          <div
                            key={ev.id}
                            className="inline-flex items-center gap-1.5 rounded bg-[var(--s3)] border border-[var(--border)] px-2 py-0.5 text-xs"
                          >
                            <EventIcon type={ev.type} />
                            <span className="font-bold uppercase text-[10px]" style={{ color: evColor }}>
                              {ev.type}
                            </span>
                            {ev.bar_number && (
                              <span className="font-mono text-[10px] text-[var(--t-sec)]">
                                b{ev.bar_number}{ev.beat_number ? `.${ev.beat_number}` : ''}
                              </span>
                            )}
                            {zoom === 'FULL' && ev.notes && (
                              <span className="text-[10px] text-[var(--t-dim)] max-w-[120px] truncate">
                                {ev.notes}
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </main>

      {/* ─── BOTTOM CONTROL BAR ───────────────────────────────────────────────── */}
      <footer className="flex h-16 flex-shrink-0 items-center justify-between border-t border-[var(--border)] bg-[var(--s1)] px-4">
        {/* Zoom Selector */}
        <button
          onClick={cycleZoom}
          className="btn-ghost flex items-center gap-1.5 px-3 text-xs font-bold uppercase tracking-wider text-[var(--t-sec)] hover:text-white"
          title="Toggle Zoom / Density"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="5.5" cy="5.5" r="4" />
            <line x1="8.5" y1="8.5" x2="13" y2="13" />
          </svg>
          <span>{zoom}</span>
        </button>

        {/* Prev / Next controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="btn-ghost w-12 h-12 rounded-xl border border-[var(--border)] bg-[var(--s2)] disabled:opacity-20 flex items-center justify-center text-white"
            aria-label="Previous song"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4 4h2v12H4V4zm12 8l-8-6v12l8-6z" />
            </svg>
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === songs.length - 1}
            className="btn-primary w-12 h-12 rounded-xl flex items-center justify-center font-bold disabled:opacity-20"
            aria-label="Next song"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M14 4h2v12h-2V4zM4 16l8-6-8-6v12z" />
            </svg>
          </button>
        </div>

        {/* Setlist Song Index & Quick Drawer */}
        <button
          onClick={() => setShowDrawer(true)}
          className="btn-ghost flex items-center gap-1.5 px-3 text-xs font-bold text-[var(--t-sec)] hover:text-white"
          title="Open Setlist Song Picker"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <rect x="1" y="2" width="12" height="2" rx="0.5" />
            <rect x="1" y="6" width="12" height="2" rx="0.5" />
            <rect x="1" y="10" width="12" height="2" rx="0.5" />
          </svg>
          <span>
            {currentIndex + 1 < 10 ? `0${currentIndex + 1}` : currentIndex + 1}/
            {songs.length < 10 ? `0${songs.length}` : songs.length}
          </span>
        </button>
      </footer>

      {/* ─── SETLIST DRAWER / QUICK JUMP MODAL ─────────────────────────────────── */}
      {showDrawer && (
        <>
          <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" onClick={() => setShowDrawer(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-[var(--s1)] border-t border-[var(--border)] p-5 max-h-[85dvh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-4">
              <h2 className="text-base font-extrabold uppercase tracking-wide text-white">
                {setlist.title}
              </h2>
              <button
                onClick={() => setShowDrawer(false)}
                className="btn-ghost w-8 h-8 min-h-0 min-w-0"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5 max-h-[60dvh] overflow-y-auto">
              {songs.map((item, idx) => {
                const isSelected = idx === currentIndex
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentIndex(idx)
                      setShowDrawer(false)
                    }}
                    className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'border-[var(--t-pri)] bg-[var(--s3)]'
                        : 'border-[var(--border)] bg-[var(--s2)] hover:border-[var(--t-dim)]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-mono text-xs font-bold text-[var(--t-dim)]">
                        {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                      </span>
                      <span className={`text-sm font-bold truncate ${isSelected ? 'text-white' : 'text-[var(--t-pri)]'}`}>
                        {item.song.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono text-[var(--t-dim)] flex-shrink-0">
                      {item.song.key && <span>{item.song.key}</span>}
                      {item.song.bpm_default && <span>{item.song.bpm_default} BPM</span>}
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="mt-5 pt-3 border-t border-[var(--border)]">
              <Link
                href={`/setlists/${setlist.id}`}
                className="btn-ghost w-full py-2.5 text-xs font-bold text-center block text-[var(--t-sec)] hover:text-white"
              >
                ← Exit Performance Mode to Editor
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}