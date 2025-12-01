import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Navigation } from '@/components/Navigation'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Developer Birth Chart - Discover Your Coding Personality',
  description: 'Generate personalized "birth charts" based on your GitHub activity patterns. Unlock insights about your coding style, team compatibility, and development personality.',
  keywords: ['developer', 'github', 'personality', 'team compatibility', 'coding style'],
  authors: [{ name: 'Dev Birth Chart Team' }],
  openGraph: {
    title: 'Developer Birth Chart',
    description: 'Discover your coding personality through GitHub analysis',
    type: 'website',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Developer Birth Chart',
    description: 'Discover your coding personality through GitHub analysis',
    images: ['/twitter-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-gray-900 text-gray-100 antialiased`}>
        <Providers>
          <div className="relative min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-1">
              {children}
            </main>
            <footer className="border-t border-gray-800 py-8 px-6">
              <div className="max-w-7xl mx-auto text-center text-gray-400">
                <p>&copy; 2024 Developer Birth Chart. Built with ❤️ for developers.</p>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  )
}