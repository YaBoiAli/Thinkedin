import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import Sidebar from '@/components/sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Thinkedin - Share & Discover Anonymous Thoughts',
  description: 'A creative, anonymous space for sharing and discovering thoughts, stories, and advice.',
  icons: {
    icon: '/img/logotab.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 bg-gray-50 dark:bg-neutral-900">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
} 