'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import {
  type Locale,
  type TranslationKey,
  translations,
  LOCALES,
} from './translations'

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey) => string
  locales: typeof LOCALES
}

const I18nContext = createContext<I18nContextType | null>(null)

const STORAGE_KEY = 'setsong_user_locale'

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('es')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null
    if (saved && ['es', 'en', 'fr', 'de', 'pt', 'ca'].includes(saved)) {
      setLocaleState(saved)
      return
    }

    // Auto-detect browser language
    const navLang = navigator.language.slice(0, 2).toLowerCase()
    if (['es', 'en', 'fr', 'de', 'pt', 'ca'].includes(navLang)) {
      setLocaleState(navLang as Locale)
    }
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newLocale)
    }
  }

  const t = (key: TranslationKey): string => {
    const dict = translations[locale] || translations.es
    return (dict as Record<string, string>)[key] || (translations.es as Record<string, string>)[key] || key
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, locales: LOCALES }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    // Fallback if rendered outside provider
    return {
      locale: 'es' as Locale,
      setLocale: () => {},
      t: (key: TranslationKey) => (translations.es as Record<string, string>)[key] || key,
      locales: LOCALES,
    }
  }
  return ctx
}