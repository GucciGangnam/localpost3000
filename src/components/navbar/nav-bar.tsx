'use client'
// IMPORTS 
import { PanelRight, CirclePlus } from "lucide-react"
import { useSidebar } from "../ui/sidebar";
import { useUser } from "@clerk/nextjs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "../ui/button";
import { Textarea } from "@/components/ui/textarea"



// COMPONENT
export default function NavBar() {
    const { toggleSidebar } = useSidebar()
    const { user, isLoaded } = useUser()
    const userName = isLoaded ? user?.fullName : "User Name"
    const userImage = isLoaded ? user?.imageUrl : "/default-avatar.png"

    return (
        <nav className="flex justify-between items-center p-4">

            <div onClick={toggleSidebar} id="left" className="flex gap-2 items-center cursor-pointer">


                <PanelRight size={35} color="var(--muted-foreground)" />

                <h1 className="font-bold text-xl">LocalPost</h1>
            </div>

            <div id="right" className="flex gap-2 items-center hover:bg-muted p-2 rounded-md cursor-pointer">

                <Dialog>
                    <DialogTrigger className="flex gap-2 items-center">

                        New Post
                        <CirclePlus size={30} className="animate-pulse" />

                    </DialogTrigger>
                    <DialogContent aria-description={"New post"} className="flex">

                        <div id="left">
                            <img
                                src={userImage}
                                alt="Avatar"
                                className="rounded-full w-[35px] h-[35px]"
                                style={{ aspectRatio: "1/1", borderRadius: '100%' }}
                            />
                        </div>
                        <div id="right" className=" grow flex flex-col gap-2">
                            <div id="top">
                                <DialogTitle>{userName}</DialogTitle>
                                <div className="text-sm text-muted-foreground">Just now</div>
                            </div>
                            <div id="Text">
                                <Textarea maxLength={140} />
                            </div>

                            <div id="bottom" className="w-fill flex justify-between items-center">
                                <button className="bg-muted px-4 rounded-sm text-muted-foreground hover:bg-input">Add photo</button>
                                <Button className="bg-orange hover:bg-orange hover:opacity-80">Post</Button>
                            </div>
                        </div>

                    </DialogContent>
                </Dialog>
            </div>

        </nav>
    )
}