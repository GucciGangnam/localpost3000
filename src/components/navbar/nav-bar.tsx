'use client'
// IMPORTS 
import { PanelRight } from "lucide-react"
import { useSidebar } from "../ui/sidebar";
import NewPostDialog from "./new-post-dialog";


// COMPONENT
export default function NavBar() {
    const { toggleSidebar } = useSidebar()


    return (
        <nav className="flex justify-between items-center p-4">

            <div onClick={toggleSidebar} id="left" className="flex gap-2 items-center cursor-pointer">


                <PanelRight size={35} color="var(--muted-foreground)" />

                <h1 className="font-bold text-xl">LocalPost</h1>
            </div>

            <div id="right" className="flex gap-2 items-center hover:bg-muted p-2 rounded-md cursor-pointer">
                <NewPostDialog />

            </div>

        </nav>
    )
}


