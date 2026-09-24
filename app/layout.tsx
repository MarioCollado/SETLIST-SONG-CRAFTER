import type { Metadata, Viewport } from 'next'
import './globals.css'
import BottomNav from '@/components/ui/BottomNav'

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
  viewportFit: 'cover', // needed for notched devices (safe-area-inset)
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <main className="pb-[56px]">
          {/* pb-[56px] = height of BottomNav — prevents content hiding behind it */}
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  )
}
