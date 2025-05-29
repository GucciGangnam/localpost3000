import type { Metadata } from 'next'

// SIDEBAR 
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/sidebar/app-sidebar"




import { Geist, Geist_Mono } from 'next/font/google'
import '../globals.css'
import NavBar from '@/components/navbar/nav-bar'

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
})

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
})

export const metadata: Metadata = {
    title: 'LocalPost',
    description: 'Welcome to local post ',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {

    return (

            <>
                    {/* Sidebar */}
                    <SidebarProvider>
                        <AppSidebar />
                        <div className='w-full'>
                            <NavBar />
                            {/* Page */}
                            {children}
                        </div>
                    </SidebarProvider>
            </>

    )
}