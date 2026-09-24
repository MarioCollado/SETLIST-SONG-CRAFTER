'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { SongWithSections, SectionWithEvents, Event as SongEvent } from '@/types'
import { createClient } from '@/lib/supabase-client'
import SectionCard from './SectionCard'
import AddSectionModal, { type SectionFormData } from './AddSectionModal'
import AddEventModal, { type EventFormData } from './AddEventModal'
import { useI18n } from '@/lib/i18n/context'
import LanguageSelector from '@/components/ui/LanguageSelector'

// ─── Song metadata form ───────────────────────────────────────────────────────
interface MetaFormProps {
  song: SongWithSections
  onUpdated: (updated: SongWithSections) => void
}

function SongMetaForm({ song, onUpdated }: MetaFormProps) {
  const { t } = useI18n()
  const router = useRouter()
  const [form, setForm] = useState({
    title: song.title,
    key: song.key ?? '',
    bpm_default: song.bpm_default?.toString() ?? '',
    time_signature: song.time_signature,
    genre: song.genre ?? '',
    notes: song.notes ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
    setSaved(false)
  }

  async function handleSave() {
    setError(null)
    setSaving(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('songs')
        .update({
          title: form.title.trim() || 'Untitled',
          key: form.key.trim() || null,
          bpm_default: form.bpm_default ? Number(form.bpm_default) : null,
          time_signature: form.time_signature.trim() || '4/4',
          genre: form.genre.trim() || null,
          notes: form.notes.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', song.id)
        .select()
        .single()
      if (error) throw error
      onUpdated({ ...song, ...data })
      setSaved(true)
      router.refresh()
      setTimeout(() => setSaved(false), 2000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card mx-4 mt-4 p-4 space-y-4">
      {/* Title */}
      <div>
        <label className="label">{t('song_title')}</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          className="input text-base font-semibold"
        />
      </div>

      {/* Key · BPM · Time sig */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="label">{t('key')}</label>
          <input
            type="text"
            value={form.key}
            onChange={(e) => set('key', e.target.value)}
            placeholder="e.g. Am"
            className="input"
          />
        </div>
        <div>
          <label className="label">{t('bpm')}</label>
          <input
            type="number"
            min={20}
            max={400}
            value={form.bpm_default}
            onChange={(e) => set('bpm_default', e.target.value)}
            placeholder="120"
            className="input"
          />
        </div>
        <div>
          <label className="label">{t('time_sig')}</label>
          <input
            type="text"
            value={form.time_signature}
            onChange={(e) => set('time_signature', e.target.value)}
            placeholder="4/4"
            className="input"
          />
        </div>
      </div>

      {/* Genre */}
      <div>
        <label className="label">
          {t('genre')}{' '}
          <span className="text-[var(--t-dim)] normal-case font-normal">({t('optional')})</span>
        </label>
        <input
          type="text"
          value={form.genre}
          onChange={(e) => set('genre', e.target.value)}
          placeholder="e.g. Rock, Pop, Jazz…"
          className="input"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="label">
          {t('notes')}{' '}
          <span className="text-[var(--t-dim)] normal-case font-normal">({t('optional')})</span>
        </label>
        <textarea
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
          rows={2}
          placeholder={t('notes_placeholder')}
          className="input resize-none"
        />
      </div>

      {error && (
        <p className="text-sm text-[#E05555] bg-[#E0555515] rounded-lg px-3 py-2">{error}</p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="btn-primary w-full text-sm font-bold py-2.5 rounded-xl disabled:opacity-50"
        style={{ minHeight: '44px' }}
      >
        {saving ? t('saving') : saved ? t('saved') : t('save_song')}
      </button>
    </div>
  )
}

// ─── Main editor ─────────────────────────────────────────────────────────────
interface SongEditorClientProps {
  initialSong: SongWithSections
  userId: string
}

export default function SongEditorClient({ initialSong, userId }: SongEditorClientProps) {
  const { t } = useI18n()
  const router = useRouter()
  const [song, setSong] = useState<SongWithSections>(initialSong)
  const [showAddSection, setShowAddSection] = useState(false)
  const [editingSection, setEditingSection] = useState<SectionWithEvents | null>(null)
  const [addEventForSection, setAddEventForSection] = useState<string | null>(null)

  const supabase = createClient()

  // Compute next bar start from last section
  const nextBarStart =
    song.sections.length > 0
      ? Math.max(...song.sections.map((s) => s.bar_end)) + 1
      : 1

  // ── Section CRUD ──────────────────────────────────────────────────────────

  const handleSaveSection = useCallback(
    async (data: SectionFormData) => {
      if (editingSection) {
        // Update
        const { data: updated, error } = await supabase
          .from('sections')
          .update({
            type: data.type,
            label: data.label || null,
            bar_start: data.bar_start,
            bar_end: data.bar_end,
            bpm_override: data.bpm_override,
            rhythm_notes: data.rhythm_notes || null,
            notes: data.notes || null,
          })
          .eq('id', editingSection.id)
          .select()
          .single()
        if (error) throw error
        setSong((s) => ({
          ...s,
          sections: s.sections.map((sec) =>
            sec.id === editingSection.id ? { ...sec, ...updated } : sec
          ),
        }))
      } else {
        // Create
        const nextIndex = song.sections.length
        const { data: created, error } = await supabase
          .from('sections')
          .insert({
            song_id: song.id,
            user_id: userId,
            type: data.type,
            label: data.label || null,
            order_index: nextIndex,
            bar_start: data.bar_start,
            bar_end: data.bar_end,
            bpm_override: data.bpm_override,
            rhythm_notes: data.rhythm_notes || null,
            notes: data.notes || null,
          })
          .select()
          .single()
        if (error) throw error
        setSong((s) => ({
          ...s,
          sections: [...s.sections, { ...created, events: [] }],
        }))
      }
      setEditingSection(null)
      router.refresh()
    },
    [editingSection, song.id, song.sections.length, userId, supabase, router]
  )

  const handleDeleteSection = useCallback(
    async (id: string) => {
      const { error } = await supabase.from('sections').delete().eq('id', id)
      if (error) { alert(error.message); return }
      setSong((s) => ({
        ...s,
        sections: s.sections
          .filter((sec) => sec.id !== id)
          .map((sec, i) => ({ ...sec, order_index: i })),
      }))
      router.refresh()
    },
    [supabase, router]
  )

  const handleMoveSection = useCallback(
    async (id: string, direction: 'up' | 'down') => {
      const sections = [...song.sections]
      const idx = sections.findIndex((s) => s.id === id)
      if (idx < 0) return
      const swap = direction === 'up' ? idx - 1 : idx + 1
      if (swap < 0 || swap >= sections.length) return

      // Swap
      ;[sections[idx], sections[swap]] = [sections[swap], sections[idx]]
      const reordered = sections.map((s, i) => ({ ...s, order_index: i }))
      setSong((s) => ({ ...s, sections: reordered }))

      // Persist
      const updates = reordered.map((s) => ({ id: s.id, song_id: song.id, order_index: s.order_index }))
      const { error } = await supabase.from('sections').upsert(updates, { onConflict: 'id' })
      if (error) alert(error.message)
    },
    [song.id, song.sections, supabase]
  )

  // ── Event CRUD ────────────────────────────────────────────────────────────

  const handleSaveEvent = useCallback(
    async (data: EventFormData) => {
      if (!addEventForSection) return
      const section = song.sections.find((s) => s.id === addEventForSection)
      if (!section) return
      const nextIdx = section.events.length

      const { data: created, error } = await supabase
        .from('events')
        .insert({
          section_id: addEventForSection,
          user_id: userId,
          type: data.type,
          icon: null,
          order_index: nextIdx,
          bar_number: data.bar_number,
          beat_number: data.beat_number,
          duration_bars: data.duration_bars,
          notes: data.notes || null,
        })
        .select()
        .single()
      if (error) throw error

      setSong((s) => ({
        ...s,
        sections: s.sections.map((sec) =>
          sec.id === addEventForSection
            ? { ...sec, events: [...sec.events, created as SongEvent] }
            : sec
        ),
      }))
      router.refresh()
    },
    [addEventForSection, song.sections, userId, supabase, router]
  )

  const handleDeleteEvent = useCallback(
    async (eventId: string) => {
      const { error } = await supabase.from('events').delete().eq('id', eventId)
      if (error) { alert(error.message); return }
      setSong((s) => ({
        ...s,
        sections: s.sections.map((sec) => ({
          ...sec,
          events: sec.events.filter((ev) => ev.id !== eventId),
        })),
      }))
      router.refresh()
    },
    [supabase, router]
  )

  // ── Delete song ───────────────────────────────────────────────────────────

  async function handleDeleteSong() {
    if (!confirm(t('delete_song_confirm'))) return
    const { error } = await supabase.from('songs').delete().eq('id', song.id)
    if (error) { alert(error.message); return }
    router.push('/songs')
    router.refresh()
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="pb-28">
      {/* Page header */}
      <header className="flex items-center gap-3 px-4 py-4 border-b border-[var(--border)] bg-[var(--s1)] sticky top-0 z-20">
        <Link
          href="/songs"
          className="btn-ghost w-10 h-10 min-h-0 min-w-0"
          aria-label={t('back')}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4L6 9l5 5" />
          </svg>
        </Link>
        <h1 className="flex-1 text-base font-bold text-[var(--t-pri)] uppercase tracking-wide truncate">
          {song.title}
        </h1>
        <LanguageSelector />
        <button
          type="button"
          onClick={handleDeleteSong}
          className="btn-danger w-10 h-10 min-h-0 min-w-0"
          aria-label={t('delete')}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 4h12M6 4V2h4v2M13 4l-1 10H4L3 4" />
          </svg>
        </button>
      </header>

      {/* Metadata form */}
      <SongMetaForm song={song} onUpdated={setSong} />

      {/* Sections */}
      <div className="px-4 mt-6 mb-2 flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--t-sec)]">
          {t('sections')}{' '}
          <span className="text-[var(--t-dim)] ml-1">{song.sections.length}</span>
        </h2>
        <button
          type="button"
          onClick={() => { setEditingSection(null); setShowAddSection(true) }}
          className="btn-ghost h-8 min-h-0 px-3 text-xs gap-1.5"
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M5.5 1v9M1 5.5h9" />
          </svg>
          {t('add_section')}
        </button>
      </div>

      <div className="px-4 space-y-2">
        {song.sections.length === 0 ? (
          <p className="text-center py-10 text-sm text-[var(--t-dim)]">
            {t('no_sections_yet')}
          </p>
        ) : (
          song.sections.map((section, i) => (
            <SectionCard
              key={section.id}
              section={section}
              index={i}
              total={song.sections.length}
              onEdit={(s) => { setEditingSection(s); setShowAddSection(true) }}
              onDelete={handleDeleteSection}
              onMoveUp={(id) => handleMoveSection(id, 'up')}
              onMoveDown={(id) => handleMoveSection(id, 'down')}
              onDeleteEvent={handleDeleteEvent}
              onAddEvent={(sectionId) => setAddEventForSection(sectionId)}
            />
          ))
        )}
      </div>

      {/* Add / edit section modal */}
      <AddSectionModal
        isOpen={showAddSection}
        editing={editingSection}
        nextBarStart={nextBarStart}
        onClose={() => { setShowAddSection(false); setEditingSection(null) }}
        onSave={handleSaveSection}
      />

      {/* Add event modal */}
      <AddEventModal
        isOpen={addEventForSection !== null}
        onClose={() => setAddEventForSection(null)}
        onSave={handleSaveEvent}
      />
    </div>
  )
}