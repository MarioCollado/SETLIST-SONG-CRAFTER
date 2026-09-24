'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { Song } from '@/types'
import { useI18n } from '@/lib/i18n/context'
import LanguageSelector from '@/components/ui/LanguageSelector'

interface SongsListClientProps {
  initialSongs: Song[]
  onNewAction: () => Promise<void>
}

export default function SongsListClient({ initialSongs, onNewAction }: SongsListClientProps) {
  const { t } = useI18n()
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)

  const filteredSongs = useMemo(() => {
    if (!search.trim()) return initialSongs
    const q = search.toLowerCase().trim()
    return initialSongs.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        (s.key && s.key.toLowerCase().includes(q)) ||
        (s.bpm_default && s.bpm_default.toString().includes(q)) ||
        (s.genre && s.genre.toLowerCase().includes(q))
    )
  }, [initialSongs, search])

  return (
    <div className="min-h-dvh pb-20">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-[var(--s1)] border-b border-[var(--border)]">
        <h1 className="text-lg font-extrabold uppercase tracking-wide text-[var(--t-pri)]">
          {t('songs')}
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
      {initialSongs.length > 0 && (
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
      <div className="px-4 py-2 space-y-2">
        {filteredSongs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3 opacity-30">♪</p>
            <p className="text-sm text-[var(--t-dim)]">
              {initialSongs.length === 0 ? t('no_songs') : t('no_songs_yet')}
            </p>
          </div>
        ) : (
          filteredSongs.map((song) => (
            <Link
              key={song.id}
              href={`/songs/${song.id}`}
              className="card flex items-center gap-3 px-4 py-3.5 active:scale-[0.99] transition-transform border border-[var(--border)]"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[var(--t-pri)] truncate">{song.title}</p>
                <p className="text-xs text-[var(--t-sec)] mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5">
                  {song.key && <span className="text-amber-400 font-bold">{song.key}</span>}
                  {song.bpm_default && <span className="font-mono">{song.bpm_default} BPM</span>}
                  {song.time_signature && song.time_signature !== '4/4' && (
                    <span>{song.time_signature}</span>
                  )}
                  {song.genre && <span>{song.genre}</span>}
                  {!song.key && !song.bpm_default && !song.genre && (
                    <span className="text-[var(--t-dim)]">{t('no_details')}</span>
                  )}
                </p>
              </div>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="var(--t-dim)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 4l4 4-4 4" />
              </svg>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}