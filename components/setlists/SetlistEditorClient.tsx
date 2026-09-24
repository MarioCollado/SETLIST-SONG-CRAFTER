'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { SetlistWithSongs, Song, SetlistSongWithSong } from '@/types'
import { createClient } from '@/lib/supabase-client'
import { useI18n } from '@/lib/i18n/context'
import LanguageSelector from '@/components/ui/LanguageSelector'

interface SetlistEditorClientProps {
  initialSetlist: SetlistWithSongs
  availableSongs: Song[]
  userId: string
}

export default function SetlistEditorClient({
  initialSetlist,
  availableSongs,
  userId,
}: SetlistEditorClientProps) {
  const { t } = useI18n()
  const router = useRouter()
  const [setlist, setSetlist] = useState<SetlistWithSongs>(initialSetlist)

  // Meta state
  const [meta, setMeta] = useState({
    title: setlist.title,
    date: setlist.date ?? '',
    venue: setlist.venue ?? '',
    notes: setlist.notes ?? '',
  })
  const [savingMeta, setSavingMeta] = useState(false)
  const [metaSaved, setMetaSaved] = useState(false)

  // Add song modal state
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedSongId, setSelectedSongId] = useState<string>('')
  const [addingSong, setAddingSong] = useState(false)
  const [songSearchQuery, setSongSearchQuery] = useState('')

  // Override note edit modal / state
  const [editingNoteForSong, setEditingNoteForSong] = useState<SetlistSongWithSong | null>(null)
  const [overrideNoteText, setOverrideNoteText] = useState('')

  const supabase = createClient()

  // ── Meta update ────────────────────────────────────────────────────────────

  async function handleSaveMeta() {
    setSavingMeta(true)
    try {
      const { data, error } = await supabase
        .from('setlists')
        .update({
          title: meta.title.trim() || 'Untitled Setlist',
          date: meta.date || null,
          venue: meta.venue.trim() || null,
          notes: meta.notes.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', setlist.id)
        .select()
        .single()

      if (error) throw error
      setSetlist((prev) => ({ ...prev, ...data }))
      setMetaSaved(true)
      router.refresh()
      setTimeout(() => setMetaSaved(false), 2000)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error.')
    } finally {
      setSavingMeta(false)
    }
  }

  // ── Reorder songs ─────────────────────────────────────────────────────────

  const handleMoveSong = useCallback(
    async (index: number, direction: 'up' | 'down') => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= setlist.setlist_songs.length) return

      const items = [...setlist.setlist_songs]
      const [moved] = items.splice(index, 1)
      items.splice(targetIndex, 0, moved)

      const reordered = items.map((item, idx) => ({ ...item, order_index: idx }))
      setSetlist((prev) => ({ ...prev, setlist_songs: reordered }))

      const updates = reordered.map((item) => ({
        id: item.id,
        setlist_id: setlist.id,
        order_index: item.order_index,
      }))

      const { error } = await supabase.from('setlist_songs').upsert(updates, { onConflict: 'id' })
      if (error) alert(error.message)
    },
    [setlist.id, setlist.setlist_songs, supabase]
  )

  // ── Remove song ───────────────────────────────────────────────────────────

  async function handleRemoveSong(songId: string) {
    if (!confirm(t('confirm_delete'))) return

    const { error } = await supabase
      .from('setlist_songs')
      .delete()
      .eq('setlist_id', setlist.id)
      .eq('song_id', songId)

    if (error) {
      alert(error.message)
      return
    }

    const updated = setlist.setlist_songs
      .filter((item) => item.song_id !== songId)
      .map((item, idx) => ({ ...item, order_index: idx }))

    setSetlist((prev) => ({ ...prev, setlist_songs: updated }))
    router.refresh()
  }

  // ── Add song ──────────────────────────────────────────────────────────────

  async function handleAddSong() {
    if (!selectedSongId) return
    setAddingSong(true)

    try {
      const nextIndex = setlist.setlist_songs.length
      const { data: inserted, error } = await supabase
        .from('setlist_songs')
        .insert({
          setlist_id: setlist.id,
          song_id: selectedSongId,
          user_id: userId,
          order_index: nextIndex,
        })
        .select(`
          *,
          song:songs (
            *,
            sections (
              *,
              events ( * )
            )
          )
        `)
        .single()

      if (error) throw error

      setSetlist((prev) => ({
        ...prev,
        setlist_songs: [...prev.setlist_songs, inserted as unknown as SetlistSongWithSong],
      }))

      setShowAddModal(false)
      setSelectedSongId('')
      setSongSearchQuery('')
      router.refresh()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error.')
    } finally {
      setAddingSong(false)
    }
  }

  // ── Override note save ────────────────────────────────────────────────────

  async function handleSaveOverrideNote() {
    if (!editingNoteForSong) return
    try {
      const { error } = await supabase
        .from('setlist_songs')
        .update({ override_notes: overrideNoteText.trim() || null })
        .eq('id', editingNoteForSong.id)

      if (error) throw error

      setSetlist((prev) => ({
        ...prev,
        setlist_songs: prev.setlist_songs.map((item) =>
          item.id === editingNoteForSong.id
            ? { ...item, override_notes: overrideNoteText.trim() || null }
            : item
        ),
      }))

      setEditingNoteForSong(null)
      router.refresh()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error.')
    }
  }

  // ── Delete setlist ────────────────────────────────────────────────────────

  async function handleDeleteSetlist() {
    if (!confirm(t('delete_setlist_confirm'))) return
    const { error } = await supabase.from('setlists').delete().eq('id', setlist.id)
    if (error) {
      alert(error.message)
      return
    }
    router.push('/setlists')
    router.refresh()
  }

  const existingSongIds = new Set(setlist.setlist_songs.map((s) => s.song_id))
  const candidateSongs = availableSongs
    .filter((s) => !existingSongIds.has(s.id))
    .filter((s) => {
      if (!songSearchQuery.trim()) return true
      const q = songSearchQuery.toLowerCase().trim()
      return (
        s.title.toLowerCase().includes(q) ||
        (s.key && s.key.toLowerCase().includes(q)) ||
        (s.bpm_default && s.bpm_default.toString().includes(q)) ||
        (s.genre && s.genre.toLowerCase().includes(q))
      )
    })

  return (
    <div className="pb-28">
      {/* Top Header */}
      <header className="flex items-center gap-3 px-4 py-4 border-b border-[var(--border)] bg-[var(--s1)] sticky top-0 z-20">
        <Link
          href="/setlists"
          className="btn-ghost w-10 h-10 min-h-0 min-w-0"
          aria-label={t('back')}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4L6 9l5 5" />
          </svg>
        </Link>
        <h1 className="flex-1 text-base font-bold text-[var(--t-pri)] uppercase tracking-wide truncate">
          {setlist.title}
        </h1>
        <LanguageSelector />
        <button
          type="button"
          onClick={handleDeleteSetlist}
          className="btn-danger w-10 h-10 min-h-0 min-w-0"
          aria-label={t('delete')}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 4h12M6 4V2h4v2M13 4l-1 10H4L3 4" />
          </svg>
        </button>
      </header>

      {/* Hero CTA: Performance Mode */}
      <div className="mx-4 mt-4">
        <Link
          href={`/setlists/${setlist.id}/perform`}
          className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-sm font-extrabold uppercase tracking-wider rounded-xl shadow-lg active:scale-[0.99] transition-transform"
          style={{ minHeight: '48px' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <polygon points="3,2 14,8 3,14" />
          </svg>
          {t('enter_performance_mode')}
        </Link>
      </div>

      {/* Setlist Details Card */}
      <div className="card mx-4 mt-4 p-4 space-y-4">
        <div>
          <label className="label">{t('setlist_title')}</label>
          <input
            type="text"
            value={meta.title}
            onChange={(e) => setMeta((m) => ({ ...m, title: e.target.value }))}
            className="input text-base font-semibold"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">{t('date')}</label>
            <input
              type="date"
              value={meta.date}
              onChange={(e) => setMeta((m) => ({ ...m, date: e.target.value }))}
              className="input"
            />
          </div>
          <div>
            <label className="label">{t('venue')}</label>
            <input
              type="text"
              value={meta.venue}
              onChange={(e) => setMeta((m) => ({ ...m, venue: e.target.value }))}
              placeholder={t('venue_placeholder')}
              className="input"
            />
          </div>
        </div>

        <div>
          <label className="label">{t('general_notes')}</label>
          <textarea
            value={meta.notes}
            onChange={(e) => setMeta((m) => ({ ...m, notes: e.target.value }))}
            rows={2}
            placeholder={t('general_notes_placeholder')}
            className="input resize-none"
          />
        </div>

        <button
          type="button"
          onClick={handleSaveMeta}
          disabled={savingMeta}
          className="btn-primary w-full text-xs font-bold py-2.5 rounded-xl disabled:opacity-50"
          style={{ minHeight: '42px' }}
        >
          {savingMeta ? t('saving') : metaSaved ? t('saved') : t('save_setlist_info')}
        </button>
      </div>

      {/* Setlist Songs Section */}
      <div className="px-4 mt-6 mb-2 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--t-sec)]">
          {t('setlist_songs_title')}{' '}
          <span className="text-[var(--t-dim)] ml-1">({setlist.setlist_songs.length})</span>
        </h2>
        <button
          type="button"
          onClick={() => {
            setSongSearchQuery('')
            setSelectedSongId('')
            setShowAddModal(true)
          }}
          className="btn-ghost h-8 min-h-0 px-3 text-xs gap-1.5"
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5.5 1v9M1 5.5h9" />
          </svg>
          {t('add_song')}
        </button>
      </div>

      {/* Songs list */}
      <div className="px-4 space-y-2">
        {setlist.setlist_songs.length === 0 ? (
          <div className="card text-center py-10 px-4 text-sm text-[var(--t-dim)]">
            {t('no_songs_in_setlist_editor')}
          </div>
        ) : (
          setlist.setlist_songs.map((item, index) => {
            const song = item.song
            return (
              <div
                key={item.id}
                className="card flex items-stretch overflow-hidden border border-[var(--border)]"
              >
                {/* Index badge */}
                <div className="w-10 bg-[var(--s3)] flex items-center justify-center font-bold text-xs text-[var(--t-sec)] border-r border-[var(--border)]">
                  {index + 1 < 10 ? `0${index + 1}` : index + 1}
                </div>

                {/* Content */}
                <div className="flex-1 p-3 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/songs/${song.id}`}
                        className="font-bold text-sm text-[var(--t-pri)] hover:underline truncate block"
                      >
                        {song.title}
                      </Link>
                      <p className="text-xs text-[var(--t-dim)] mt-0.5 flex flex-wrap gap-2">
                        {song.key && <span className="text-[var(--t-sec)]">{song.key}</span>}
                        {song.bpm_default && <span>{song.bpm_default} BPM</span>}
                        {song.time_signature && <span>{song.time_signature}</span>}
                        <span>{song.sections?.length ?? 0} {t('sections').toLowerCase()}</span>
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      <button
                        onClick={() => handleMoveSong(index, 'up')}
                        disabled={index === 0}
                        className="btn-ghost w-7 h-7 min-h-0 min-w-0 disabled:opacity-20"
                        title="Move Up"
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M6 9.5V2.5M2.5 6l3.5-3.5 3.5 3.5" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleMoveSong(index, 'down')}
                        disabled={index === setlist.setlist_songs.length - 1}
                        className="btn-ghost w-7 h-7 min-h-0 min-w-0 disabled:opacity-20"
                        title="Move Down"
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M6 2.5v7M2.5 6l3.5 3.5 3.5-3.5" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleRemoveSong(song.id)}
                        className="btn-danger w-7 h-7 min-h-0 min-w-0 ml-1"
                        title={t('delete')}
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1.5 1.5l9 9M10.5 1.5l-9 9" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Override notes pill / button */}
                  <div className="mt-2 pt-2 border-t border-[var(--border)] flex items-center justify-between">
                    <span className="text-2xs text-[var(--t-dim)] uppercase tracking-wide">
                      {t('live_notes_label')}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingNoteForSong(item)
                        setOverrideNoteText(item.override_notes ?? '')
                      }}
                      className="text-xs text-[var(--t-sec)] hover:text-[var(--t-pri)] truncate max-w-[200px]"
                    >
                      {item.override_notes ? item.override_notes : t('add_live_note')}
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Modal: Add Song to Setlist (Elevated with Sticky Footer) */}
      {showAddModal && (
        <>
          <div
            className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowAddModal(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-[110] rounded-t-2xl bg-[var(--s1)] border-t border-[var(--border)] animate-slide-up flex flex-col max-h-[88dvh]">
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-[var(--border)]" />
            </div>

            <div className="px-5 pt-1 pb-3 flex-shrink-0 border-b border-[var(--border)]">
              <h2 className="text-base font-bold text-[var(--t-pri)]">
                {t('add_song_modal_title')}
              </h2>
              {/* Quick Search */}
              <div className="mt-2.5 relative">
                <input
                  type="text"
                  value={songSearchQuery}
                  onChange={(e) => setSongSearchQuery(e.target.value)}
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
              </div>
            </div>

            <div className="px-5 py-3 overflow-y-auto flex-1 space-y-2">
              {candidateSongs.length === 0 ? (
                <p className="text-xs text-[var(--t-dim)] py-8 text-center">
                  {t('all_songs_in_setlist')}
                </p>
              ) : (
                candidateSongs.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedSongId(s.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-colors flex items-center justify-between ${
                      selectedSongId === s.id
                        ? 'border-[var(--t-pri)] bg-[var(--s3)]'
                        : 'border-[var(--border)] bg-[var(--s2)] hover:border-[var(--t-dim)]'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-[var(--t-pri)]">{s.title}</p>
                      <p className="text-xs text-[var(--t-dim)] mt-0.5">
                        {s.key && `${s.key} • `}
                        {s.bpm_default ? `${s.bpm_default} BPM` : 'BPM —'}
                      </p>
                    </div>
                    {selectedSongId === s.id && (
                      <span className="text-xs font-bold text-[var(--t-pri)]">✓</span>
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Elevated Sticky Actions Footer */}
            <div className="flex-shrink-0 border-t border-[var(--border)] bg-[var(--s2)] px-5 pt-3 pb-8 flex gap-3 shadow-2xl">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="btn-ghost flex-1 text-sm font-semibold rounded-xl border border-[var(--border)]"
                style={{ minHeight: '44px' }}
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleAddSong}
                disabled={!selectedSongId || addingSong}
                className="btn-primary flex-1 text-sm font-bold rounded-xl disabled:opacity-50"
                style={{ minHeight: '44px' }}
              >
                {addingSong ? t('saving') : t('add_song')}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal: Edit Override Note (Elevated with Sticky Footer) */}
      {editingNoteForSong && (
        <>
          <div
            className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm animate-fade-in"
            onClick={() => setEditingNoteForSong(null)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-[110] rounded-t-2xl bg-[var(--s1)] border-t border-[var(--border)] animate-slide-up flex flex-col max-h-[85dvh]">
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div className="w-10 h-1 rounded-full bg-[var(--border)]" />
            </div>

            <div className="px-5 py-3 flex-1 overflow-y-auto">
              <h2 className="text-base font-bold text-[var(--t-pri)] mb-1">
                {t('live_note_modal_title')} {editingNoteForSong.song.title}
              </h2>
              <p className="text-xs text-[var(--t-dim)] mb-4">
                {t('live_note_modal_desc')}
              </p>

              <textarea
                value={overrideNoteText}
                onChange={(e) => setOverrideNoteText(e.target.value)}
                rows={3}
                placeholder="..."
                className="input resize-none mb-2"
                autoFocus
              />
            </div>

            {/* Elevated Sticky Actions Footer */}
            <div className="flex-shrink-0 border-t border-[var(--border)] bg-[var(--s2)] px-5 pt-3 pb-8 flex gap-3 shadow-2xl">
              <button
                type="button"
                onClick={() => setEditingNoteForSong(null)}
                className="btn-ghost flex-1 text-sm font-semibold rounded-xl border border-[var(--border)]"
                style={{ minHeight: '44px' }}
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleSaveOverrideNote}
                className="btn-primary flex-1 text-sm font-bold rounded-xl"
                style={{ minHeight: '44px' }}
              >
                {t('save')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}