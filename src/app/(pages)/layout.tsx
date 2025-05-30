import type { Metadata } from 'next'

// SIDEBAR 
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/sidebar/app-sidebar"


import '../globals.css'
import NavBar from '@/components/navbar/nav-bar'

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