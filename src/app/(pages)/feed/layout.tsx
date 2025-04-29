import type { Metadata } from 'next'

import { Geist, Geist_Mono } from 'next/font/google'
import '../../globals.css'
import SorterAndFilter from '@/components/sortandfilter/sort-and-filter'
import NavBarFeed from '@/components/navbar/nav-bar'

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
})

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
})

export const metadata: Metadata = {
    title: 'LocalHost',
    description: 'Your feed',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (

        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                {/* Filter sorter? */}
                {/* Nav Bar */}
                <SorterAndFilter />
                {children}

            </body>
        </html>
    )
}