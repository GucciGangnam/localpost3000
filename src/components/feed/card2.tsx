//  IMPORTS 
import { Heart, MessageSquare, Waypoints, Pin, BadgeCheck, Verified } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"



// COMPONENT
export default function Card2( ) {

    return (
        <div className="bg-muted flex p-2 gap-2 rounded-md row-span-2">

            <div id="left" className="pt-1">
                <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
            </div>

            <div id="right" className="flex flex-col gap-2 grow justify-between">
                <div id="right-top" className=" flex flex-col gap-2 ">
                    <div id="meta">
                        <span className="flex items-center gap-2"><div id="name">User Name</div> <div><Verified size={20} fill="var(--orange)" color="var(--background)" /></div></span>
                        <div id="timestamp" className="text-xs text-muted-foreground">Timestamp</div>
                    </div>
                </div>
                <div id="right-middle" className=" flex flex-col gap-2 grow">
                    <div id="content">
                        Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis
                    </div>
                    {/* Attachments */}

                        <div id="attachment" className="grow">
                            Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis
                        </div>

                </div>


                <div id="right-bottom" className="flex justify-end gap-4">
                    <Waypoints
                        fill="var(--input)"
                        color="var(--input)"
                    />
                    <MessageSquare
                        fill="var(--input)"
                        color="var(--input)"
                    />
                    <Heart
                        fill="var(--input)"
                        color="var(--input)"
                    />
                    <Pin
                        fill="var(--input)"
                        color="var(--input)"
                    />
                </div>
            </div>


        </div>
    )
}