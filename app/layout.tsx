import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Providers from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LocalConnect - Civic Issue Reporting Platform',
  description: 'Report civic issues, engage with your local community, and track progress of complaints.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-screen h-full flex flex-col bg-slate-50 text-slate-900`}>
        <Providers>
          <Navbar />
          <main className="flex-grow animate-fade-in relative">
            {children}
          </main>
          <footer className="bg-white border-t border-gray-200 mt-auto py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500">
              &copy; {new Date().getFullYear()} LocalConnect. Empowering local communities.
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  )
}
