'use client'

import { useState, useEffect, type FormEvent } from 'react'
import type { EventType, Event as SongEvent } from '@/types'
import { EVENT_COLORS } from '@/types'

export interface EventFormData {
  type: EventType
  bar_number: number | null
  beat_number: number | null
  duration_bars: number | null
  notes: string
}

const EVENT_TYPES: EventType[] = ['cut', 'stop', 'hit', 'tacet', 'fade', 'repeat', 'coda']

const EVENT_LABELS: Record<EventType, string> = {
  cut:    'Cut',
  stop:   'Stop',
  hit:    'Hit',
  tacet:  'Tacet',
  fade:   'Fade',
  repeat: 'Repeat',
  coda:   'Coda',
}

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
  const [form, setForm] = useState<EventFormData>(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      setError(err instanceof Error ? err.message : 'Failed to save cue.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-[var(--s1)] border-t border-[var(--border)] animate-slide-up">
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-[var(--border)]" />
        </div>

        <div className="px-4 pb-8">
          <h2 className="text-base font-semibold text-[var(--t-pri)] mb-5">
            {editing ? 'Edit Cue' : 'Add Cue'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Event type */}
            <div>
              <p className="label">Type</p>
              <div className="flex flex-wrap gap-2">
                {EVENT_TYPES.map((t) => {
                  const color = EVENT_COLORS[t]
                  const active = form.type === t
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => set('type', t)}
                      className="rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wide transition-all border"
                      style={{
                        backgroundColor: active ? `${color}2A` : 'var(--s3)',
                        color: active ? color : 'var(--t-dim)',
                        borderColor: active ? color : 'transparent',
                      }}
                    >
                      {EVENT_LABELS[t]}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Position */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label">Bar</label>
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
                <label className="label">Beat</label>
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
                <label className="label">Duration</label>
                <input
                  type="number"
                  min={1}
                  value={form.duration_bars ?? ''}
                  onChange={(e) =>
                    set('duration_bars', e.target.value ? Number(e.target.value) : null)
                  }
                  placeholder="bars"
                  className="input"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="label">Notes <span className="text-[var(--t-dim)] normal-case font-normal">(optional)</span></label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="e.g. Hard stop, all band…"
                className="input"
              />
            </div>

            {error && (
              <p className="text-sm text-[#E05555] bg-[#E0555515] rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="btn-ghost flex-1 text-sm">
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex-1 text-sm disabled:opacity-50"
              >
                {saving ? 'Saving…' : editing ? 'Save changes' : 'Add cue'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
