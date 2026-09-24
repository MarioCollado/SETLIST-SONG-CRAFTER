'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useI18n } from '@/lib/i18n/context'

export default function BottomNav() {
  const pathname = usePathname()
  const { t } = useI18n()

  // Only show on root tabs: /setlists and /songs
  // Hide on detail pages (/songs/[id], /setlists/[id]), perform mode, and auth pages
  const isRootTab = pathname === '/setlists' || pathname === '/songs'
  if (!isRootTab) return null

  const items = [
    {
      href: '/setlists',
      label: t('setlists'),
      icon: (active: boolean) => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth={active ? 2.2 : 1.8}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 12h16.5M3.75 6.75h16.5M3.75 17.25h16.5"
          />
        </svg>
      ),
    },
    {
      href: '/songs',
      label: t('songs'),
      icon: (active: boolean) => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth={active ? 2.2 : 1.8}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
          />
        </svg>
      ),
    },
  ]

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      <ul className="flex h-[56px]">
        {items.map(({ href, label, icon }) => {
          const active = pathname === href
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={[
                  'flex flex-col items-center justify-center h-full gap-0.5',
                  'text-[10px] font-medium tracking-wide transition-colors duration-150',
                  active ? 'text-[var(--t-pri)]' : 'text-[var(--t-sec)]',
                ].join(' ')}
                aria-current={active ? 'page' : undefined}
              >
                {icon(active)}
                <span>{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}