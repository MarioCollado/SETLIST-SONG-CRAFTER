'use client'

import { useState } from 'react'
import { useI18n } from '@/lib/i18n/context'

interface LanguageSelectorProps {
  compact?: boolean
}

export default function LanguageSelector({ compact = false }: LanguageSelectorProps) {
  const { locale, setLocale, locales, t } = useI18n()
  const [isOpen, setIsOpen] = useState(false)

  const current = locales.find((l) => l.code === locale) || locales[0]

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="btn-ghost px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-[var(--t-sec)] hover:text-white flex items-center gap-1.5 border border-[var(--border)] bg-[var(--s2)]"
        style={{ minHeight: '36px' }}
        title={t('language')}
      >
        <span className="text-sm">{current.flag}</span>
        <span>{current.code.toUpperCase()}</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-[90] rounded-t-2xl bg-[var(--s1)] border-t border-[var(--border)] p-5 animate-slide-up pb-10">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-4">
              <h3 className="text-sm font-extrabold uppercase tracking-wide text-[var(--t-pri)]">
                {t('language')}
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="btn-ghost w-8 h-8 min-h-0 min-w-0"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-[60dvh] overflow-y-auto">
              {locales.map((l) => {
                const isSelected = l.code === locale
                return (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => {
                      setLocale(l.code)
                      setIsOpen(false)
                    }}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition-colors text-left ${
                      isSelected
                        ? 'border-[var(--t-pri)] bg-[var(--s3)] font-bold text-white'
                        : 'border-[var(--border)] bg-[var(--s2)] text-[var(--t-sec)] hover:text-[var(--t-pri)]'
                    }`}
                  >
                    <span className="text-xl">{l.flag}</span>
                    <span className="text-sm">{l.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </>
  )
}