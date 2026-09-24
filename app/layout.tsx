import type { Metadata, Viewport } from 'next'
// CSS side-effect imports are handled by Next.js at build time.
// @ts-expect-error Next.js resolves global CSS imports outside TypeScript's module declarations.
import './globals.css'
import BottomNav from '@/components/ui/BottomNav'
import { I18nProvider } from '@/lib/i18n/context'

export const metadata: Metadata = {
  title: 'SETSONG',
  description: 'Create songs with technical cues and group them into setlists for live performances.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SETSONG',
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0A0A0A',
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-dvh bg-[var(--bg)] text-[var(--t-pri)]">
        <I18nProvider>
          <main className="min-h-dvh">
            {children}
          </main>
          <BottomNav />
        </I18nProvider>
      </body>
    </html>
  )
}