import type { Metadata } from 'next'
import './globals.css'
import { Navigation } from '@/components'

export const metadata: Metadata = {
  title: 'HarvestAlert - Climate & Nutrition Early Warning',
  description: 'AI-powered platform for predicting crop failure and malnutrition risk',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        {/* Add padding-top to account for fixed navigation */}
        <div className="pt-16">
          {children}
        </div>
      </body>
    </html>
  )
}
