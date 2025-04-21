import type { Metadata } from 'next'
// CLERK
import {
    ClerkProvider,
    SignInButton,
    SignUpButton,
    SignedIn,
    SignedOut,
    UserButton,
} from '@clerk/nextjs'
// SIDEBAR 
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
// NAVBAR
import NavBar from '@/components/navbar/nav-bar'


import { Geist, Geist_Mono } from 'next/font/google'
import '../globals.css'

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
        <ClerkProvider>
            <html lang="en">
                <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                    {/* Sidebar */}
                    <SidebarProvider>
                        <AppSidebar />
                        <main className='w-full'>
                            {/* Nav Bar */}
                            <NavBar />
                            {/* Page */}
                            {children}
                        </main>
                    </SidebarProvider>
                </body>
            </html>
        </ClerkProvider>
    )
}