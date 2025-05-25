// IMPORTS 
import { Heart, MessageSquare, Waypoints, Pin, Ellipsis } from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"



// TYPES 



// COMPONENT
export default function CardButtons() {


    return (
        <>

            <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-0 text-input hover:text-orange"><Ellipsis/></DropdownMenuTrigger>
                <DropdownMenuContent className="bg-muted">
                    <DropdownMenuLabel>More actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="hover:!bg-input">Report</DropdownMenuItem>
                    <DropdownMenuItem className="hover:!bg-input">Hide</DropdownMenuItem>
                    <DropdownMenuItem className="hover:!bg-input">Close</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <button className="rounded-md p-1 transition-colors duration-200 flex justify-center items-center text-input hover:text-orange">
                <Waypoints
                    size={15}

                />
            </button>

            <button className="rounded-md p-1 transition-colors duration-200 flex justify-center items-center text-input hover:text-orange">
                <MessageSquare
                    size={15}
                />
            </button>

            <button className="rounded-md p-1 transition-colors duration-200 flex justify-center items-center text-input hover:text-orange">
                <Heart
                    size={15}
                />
            </button>

            <button className="rounded-md p-1 transition-colors duration-200 flex justify-center items-center text-input hover:text-orange">
                <Pin
                    size={15}
                />
            </button>
        </>
    )



}