import type { Metadata } from 'next'
import '../../globals.css'
import SorterAndFilter from '@/components/sortandfilter/sort-and-filter'


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

        <>
                {/* Filter sorter? */}
                {/* Nav Bar */}
                <SorterAndFilter />
                {children}
        </>
    )
}