'use client'
// IMPORTS 
import { PanelRight } from "lucide-react"
import { useSidebar } from "../ui/sidebar";
import NewPostDialog from "./new-post-dialog";
import { usePathname } from "next/navigation";
import Image from "next/image";


// COMPONENT
export default function NavBar() {
    const { toggleSidebar } = useSidebar()
    const heading = usePathname()
        .split('/')[1]                 // Get the first path segment
        ?.replace(/^\w/, c => c.toUpperCase()) || ''; // Capitalize first letter



    return (
        <nav className="relative flex justify-between items-center p-4">
            {/* Left section */}
            <div onClick={toggleSidebar} id="left" className="flex gap-2 items-center cursor-pointer">
                <PanelRight size={35} color="var(--muted-foreground)" />
                <h1 className="font-bold text-xl">{heading}</h1>
            </div>

            {/* Centered image */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <Image src="/logo-32.png" width={32} height={32} alt="Logo" />
            </div>

            {/* Right section */}
            <div id="right" className="flex gap-2 items-center hover:bg-muted p-2 rounded-md cursor-pointer">
                <NewPostDialog />
            </div>
        </nav>
    )
}


