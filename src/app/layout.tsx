import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ClientProviders } from '@/components/client-providers'
import { Navigation } from '@/components/navigation'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'BetTracker - Sports Betting Tracker',
  description:
    'Track your sports betting picks, wins, losses, and bankroll management',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientProviders>
          <div className="bg-background min-h-screen">
            <Navigation />
            <main className="container mx-auto px-4 py-8">{children}</main>
          </div>
          <Analytics />
          <SpeedInsights />
        </ClientProviders>
      </body>
    </html>
  )
}
