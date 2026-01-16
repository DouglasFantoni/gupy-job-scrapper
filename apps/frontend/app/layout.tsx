import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'
import ToasterProvider from '@/components/ToasterProvider'

export const metadata: Metadata = {
  title: 'Gupy Job Scraper',
  description: 'Busca e gerencia vagas de emprego da Gupy',
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="bg-gray-50 h-full overflow-hidden">
        {children}
        <ToasterProvider />
      </body>
    </html>
  )
}

