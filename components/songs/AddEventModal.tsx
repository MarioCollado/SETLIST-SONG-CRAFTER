'use client'

import { useState, useEffect, type FormEvent } from 'react'
import type { EventType, Event as SongEvent } from '@/types'
import { EVENT_COLORS } from '@/types'
import { useI18n } from '@/lib/i18n/context'

export interface EventFormData {
  type: EventType
  bar_number: number | null
  beat_number: number | null
  duration_bars: number | null
  notes: string
}

const EVENT_TYPES: EventType[] = ['cut', 'stop', 'hit', 'tacet', 'fade', 'repeat', 'coda']

const DEFAULT_FORM: EventFormData = {
  type: 'hit',
  bar_number: null,
  beat_number: null,
  duration_bars: null,
  notes: '',
}

interface AddEventModalProps {
  isOpen: boolean
  editing?: SongEvent | null
  onClose: () => void
  onSave: (data: EventFormData) => Promise<void>
}

export default function AddEventModal({
  isOpen,
  editing,
  onClose,
  onSave,
}: AddEventModalProps) {
  const { t } = useI18n()
  const [form, setForm] = useState<EventFormData>(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const eventLabels: Record<EventType, string> = {
    cut: t('ev_cut'),
    stop: t('ev_stop'),
    hit: t('ev_hit'),
    tacet: t('ev_tacet'),
    fade: t('ev_fade'),
    repeat: t('ev_repeat'),
    coda: t('ev_coda'),
  }

  useEffect(() => {
    if (!isOpen) return
    if (editing) {
      setForm({
        type: editing.type,
        bar_number: editing.bar_number,
        beat_number: editing.beat_number,
        duration_bars: editing.duration_bars,
        notes: editing.notes ?? '',
      })
    } else {
      setForm(DEFAULT_FORM)
    }
    setError(null)
  }, [isOpen, editing])

  if (!isOpen) return null

  function set<K extends keyof EventFormData>(key: K, value: EventFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await onSave(form)
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="fixed bottom-0 left-0 right-0 z-[110] rounded-t-2xl bg-[var(--s1)] border-t border-[var(--border)] animate-slide-up flex flex-col max-h-[calc(100dvh-env(safe-area-inset-top))]">
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-[var(--border)]" />
        </div>

        <div className="px-5 overflow-y-auto flex-1 min-h-0 pb-4">
          <h2 className="text-base font-bold text-[var(--t-pri)] mb-4">
            {editing ? t('edit_cue') : t('add_cue')}
          </h2>

          <form id="event-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Event type */}
            <div>
              <p className="label">{t('cue_type')}</p>
              <div className="flex flex-wrap gap-2">
                {EVENT_TYPES.map((typeKey) => {
                  const color = EVENT_COLORS[typeKey]
                  const active = form.type === typeKey
                  return (
                    <button
                      key={typeKey}
                      type="button"
                      onClick={() => set('type', typeKey)}
                      className="rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wide transition-all border"
                      style={{
                        backgroundColor: active ? `${color}2A` : 'var(--s3)',
                        color: active ? color : 'var(--t-dim)',
                        borderColor: active ? color : 'transparent',
                      }}
                    >
                      {eventLabels[typeKey] || typeKey}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Position */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label">{t('bar')}</label>
                <input
                  type="number"
                  min={1}
                  value={form.bar_number ?? ''}
                  onChange={(e) =>
                    set('bar_number', e.target.value ? Number(e.target.value) : null)
                  }
                  placeholder="—"
                  className="input"
                />
              </div>
              <div>
                <label className="label">{t('beat')}</label>
                <input
                  type="number"
                  min={1}
                  max={16}
                  value={form.beat_number ?? ''}
                  onChange={(e) =>
                    set('beat_number', e.target.value ? Number(e.target.value) : null)
                  }
                  placeholder="—"
                  className="input"
                />
              </div>
              <div>
                <label className="label">{t('duration')}</label>
                <input
                  type="number"
                  min={1}
                  value={form.duration_bars ?? ''}
                  onChange={(e) =>
                    set('duration_bars', e.target.value ? Number(e.target.value) : null)
                  }
                  placeholder="—"
                  className="input"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="label">
                {t('cue_notes')}{' '}
                <span className="text-[var(--t-dim)] normal-case font-normal">({t('optional')})</span>
              </label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder={t('cue_notes_placeholder')}
                className="input"
              />
            </div>

            {error && (
              <p className="text-sm text-[#E05555] bg-[#E0555515] rounded-lg px-3 py-2">
                {error}
              </p>
            )}
          </form>
        </div>

        {/* Elevated Sticky Actions Footer — NEVER covered by system bars */}
        <div className="flex-shrink-0 border-t border-[var(--border)] bg-[var(--s2)] px-5 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] flex gap-3 shadow-2xl">
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost flex-1 text-sm font-semibold rounded-xl border border-[var(--border)]"
            style={{ minHeight: '44px' }}
          >
            {t('cancel')}
          </button>
          <button
            form="event-form"
            type="submit"
            disabled={saving}
            className="btn-primary flex-1 text-sm font-bold rounded-xl disabled:opacity-50"
            style={{ minHeight: '44px' }}
          >
            {saving ? t('saving') : editing ? t('save_changes') : t('save')}
          </button>
        </div>
      </div>
    </>
  )
}
