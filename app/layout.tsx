import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Film Meclisi',
  description: 'İzlediğin filmleri kaydet, puanla ve yorumla.',
  generator: 'v0.app',
  icons: {
    icon: '/images/film-meclisi-favicon.png',
    apple: '/images/film-meclisi-favicon.png',
  },
  manifest: '/manifest.json', // Added manifest for PWA capabilities
}

import { Toaster } from '@/components/ui/toaster'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr" className="bg-background overflow-x-hidden">
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
        <Toaster />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
