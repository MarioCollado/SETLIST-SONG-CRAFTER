'use client'

import { useState, useEffect, type FormEvent } from 'react'
import type { SectionType, SectionWithEvents } from '@/types'
import { SECTION_COLORS } from '@/types'

export interface SectionFormData {
  type: SectionType
  label: string
  bar_start: number
  bar_end: number
  bpm_override: number | null
  rhythm_notes: string
  notes: string
}

const SECTION_TYPES: SectionType[] = [
  'intro', 'verse', 'pre', 'chorus', 'post',
  'bridge', 'solo', 'break', 'build', 'outro', 'custom',
]

interface AddSectionModalProps {
  isOpen: boolean
  editing?: SectionWithEvents | null
  nextBarStart?: number
  onClose: () => void
  onSave: (data: SectionFormData) => Promise<void>
}

const DEFAULT_FORM: SectionFormData = {
  type: 'verse',
  label: '',
  bar_start: 1,
  bar_end: 8,
  bpm_override: null,
  rhythm_notes: '',
  notes: '',
}

export default function AddSectionModal({
  isOpen,
  editing,
  nextBarStart = 1,
  onClose,
  onSave,
}: AddSectionModalProps) {
  const [form, setForm] = useState<SectionFormData>(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    if (editing) {
      setForm({
        type: editing.type,
        label: editing.label ?? '',
        bar_start: editing.bar_start,
        bar_end: editing.bar_end,
        bpm_override: editing.bpm_override,
        rhythm_notes: editing.rhythm_notes ?? '',
        notes: editing.notes ?? '',
      })
    } else {
      setForm({ ...DEFAULT_FORM, bar_start: nextBarStart, bar_end: nextBarStart + 7 })
    }
    setError(null)
  }, [isOpen, editing, nextBarStart])

  if (!isOpen) return null

  function set<K extends keyof SectionFormData>(key: K, value: SectionFormData[K]) {
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
      setError(err instanceof Error ? err.message : 'Failed to save section.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-[var(--s1)] border-t border-[var(--border)] animate-slide-up overflow-y-auto max-h-[92dvh]">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-[var(--border)]" />
        </div>

        <div className="px-4 pb-8">
          <h2 className="text-base font-semibold text-[var(--t-pri)] mb-5">
            {editing ? 'Edit Section' : 'Add Section'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Section type grid */}
            <div>
              <p className="label">Type</p>
              <div className="grid grid-cols-4 gap-1.5">
                {SECTION_TYPES.map((t) => {
                  const color = SECTION_COLORS[t]
                  const active = form.type === t
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => set('type', t)}
                      className="rounded-lg py-2 text-xs font-bold uppercase tracking-wide transition-all border"
                      style={{
                        backgroundColor: active ? `${color}2A` : 'var(--s3)',
                        color: active ? color : 'var(--t-dim)',
                        borderColor: active ? color : 'transparent',
                      }}
                    >
                      {t}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Label */}
            <div>
              <label className="label">
                Custom label{' '}
                <span className="text-[var(--t-dim)] normal-case font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={form.label}
                onChange={(e) => set('label', e.target.value)}
                placeholder="e.g. Chorus 2, Intro A…"
                className="input"
              />
            </div>

            {/* Bars */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Bar start</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={form.bar_start}
                  onChange={(e) => set('bar_start', Number(e.target.value))}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Bar end</label>
                <input
                  type="number"
                  required
                  min={form.bar_start}
                  value={form.bar_end}
                  onChange={(e) => set('bar_end', Number(e.target.value))}
                  className="input"
                />
              </div>
            </div>

            {/* BPM override */}
            <div>
              <label className="label">
                BPM override{' '}
                <span className="text-[var(--t-dim)] normal-case font-normal">(optional)</span>
              </label>
              <input
                type="number"
                min={20}
                max={400}
                value={form.bpm_override ?? ''}
                onChange={(e) =>
                  set('bpm_override', e.target.value ? Number(e.target.value) : null)
                }
                placeholder="Inherits from song"
                className="input"
              />
            </div>

            {/* Rhythm notes */}
            <div>
              <label className="label">
                Rhythm notes{' '}
                <span className="text-[var(--t-dim)] normal-case font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={form.rhythm_notes}
                onChange={(e) => set('rhythm_notes', e.target.value)}
                placeholder="e.g. Straight 8s, half-time shuffle…"
                className="input"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="label">
                Notes{' '}
                <span className="text-[var(--t-dim)] normal-case font-normal">(optional)</span>
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                rows={2}
                placeholder="Any extra instructions…"
                className="input resize-none"
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
                {saving ? 'Saving…' : editing ? 'Save changes' : 'Add section'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
