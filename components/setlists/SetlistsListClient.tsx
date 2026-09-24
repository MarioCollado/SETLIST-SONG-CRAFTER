'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { Setlist } from '@/types'
import { useI18n } from '@/lib/i18n/context'
import LanguageSelector from '@/components/ui/LanguageSelector'

interface SetlistsListClientProps {
  initialSetlists: Setlist[]
  onNewAction: () => Promise<void>
}

export default function SetlistsListClient({
  initialSetlists,
  onNewAction,
}: SetlistsListClientProps) {
  const { t, locale } = useI18n()
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)

  const filteredSetlists = useMemo(() => {
    if (!search.trim()) return initialSetlists
    const q = search.toLowerCase().trim()
    return initialSetlists.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        (s.venue && s.venue.toLowerCase().includes(q)) ||
        (s.notes && s.notes.toLowerCase().includes(q))
    )
  }, [initialSetlists, search])

  return (
    <div className="min-h-dvh pb-20">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-[var(--s1)] border-b border-[var(--border)]">
        <h1 className="text-lg font-extrabold uppercase tracking-wide text-[var(--t-pri)]">
          {t('setlists')}
        </h1>
        <div className="flex items-center gap-2">
          <LanguageSelector />
          <form
            action={async () => {
              setCreating(true)
              await onNewAction()
            }}
          >
            <button
              type="submit"
              disabled={creating}
              className="btn-primary px-3 text-xs font-bold uppercase rounded-lg disabled:opacity-50"
              style={{ height: '36px', minHeight: '36px' }}
            >
              {creating ? t('saving') : t('new')}
            </button>
          </form>
        </div>
      </header>

      {/* Quick Search */}
      {initialSetlists.length > 0 && (
        <div className="px-4 pt-3 pb-1">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('search')}
              className="input pl-8 text-xs py-2"
              style={{ minHeight: '36px' }}
            />
            <svg
              width="13"
              height="13"
              viewBox="0 0 14 14"
              fill="none"
              stroke="var(--t-dim)"
              strokeWidth="2"
              className="absolute left-2.5 top-2.5"
            >
              <circle cx="5.5" cy="5.5" r="4" />
              <line x1="8.5" y1="8.5" x2="13" y2="13" />
            </svg>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2.5 text-xs text-[var(--t-dim)] hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* List */}
      <div className="px-4 py-2 space-y-3">
        {filteredSetlists.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3 opacity-30">☷</p>
            <p className="text-sm text-[var(--t-dim)]">
              {initialSetlists.length === 0 ? t('no_setlists_hint') : t('no_songs_yet')}
            </p>
          </div>
        ) : (
          filteredSetlists.map((setlist) => (
            <div
              key={setlist.id}
              className="card overflow-hidden transition-colors border border-[var(--border)] hover:border-[var(--t-dim)]"
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/setlists/${setlist.id}`}
                      className="block font-bold text-base text-[var(--t-pri)] hover:text-white truncate"
                    >
                      {setlist.title}
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[var(--t-sec)]">
                      {setlist.date && (
                        <span>
                          {new Date(setlist.date).toLocaleDateString(locale, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      )}
                      {setlist.venue && (
                        <>
                          <span className="text-[var(--t-dim)]">•</span>
                          <span className="truncate">{setlist.venue}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <Link
                    href={`/setlists/${setlist.id}/perform`}
                    className="btn bg-[var(--s3)] text-[var(--t-pri)] hover:bg-white hover:text-black font-semibold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors flex-shrink-0"
                    style={{ minHeight: '36px' }}
                    title={t('enter_performance_mode')}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                      <polygon points="2,1 11,6 2,11" />
                    </svg>
                    {t('live')}
                  </Link>
                </div>

                {setlist.notes && (
                  <p className="text-xs text-[var(--t-sec)] mt-2 line-clamp-1">
                    {setlist.notes}
                  </p>
                )}
              </div>

              <div className="bg-[var(--s1)] px-4 py-2 flex items-center justify-between border-t border-[var(--border)] text-xs text-[var(--t-dim)]">
                <span>{t('tap_to_edit')}</span>
                <Link
                  href={`/setlists/${setlist.id}`}
                  className="text-[var(--t-sec)] hover:text-[var(--t-pri)] flex items-center gap-0.5"
                >
                  {t('edit')}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 2.5l3.5 3.5-3.5 3.5" />
                  </svg>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}