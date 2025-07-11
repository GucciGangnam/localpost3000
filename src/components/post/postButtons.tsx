'use client'
// IMPORT
import { Heart, Pin, Ellipsis, FlagTriangleRight, Tag, CircleX } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// actions
import { checkPostLiked } from "@/app/actions/post"
import { checkPostPinned } from "@/app/actions/post"
import { toggleLikePost } from "@/app/actions/post"
import { togglePinPost } from "@/app/actions/post"
import { toast } from "sonner"
import { useState, useEffect } from "react"

export default function PostButtons({ id }: { id: string }) {

    // Post liked?
    const [postLiked, setPostLiked] = useState(false);
    // Post Pinned?
    const [postPinned, setPostPinned] = useState(false);

    useEffect(() => {
        const fetchLikedStatus = async () => {
            try {
                const isLiked = await checkPostLiked(id);
                setPostLiked(isLiked);
            } catch (error) {
                console.error("Error checking liked status:", error);
            }
        };
        fetchLikedStatus();
    }, [id]);

    useEffect(() => {
        const fetchPinnedStatus = async () => {
            try {
                const isPinned = await checkPostPinned(id);
                setPostPinned(isPinned);
            } catch (error) {
                console.error("Error checking pinned status:", error);
            }
        };
        fetchPinnedStatus();
    }, [id]);


    return (
        <div className="flex gap-2 justify-evenly items-center mb-2 rounded-md">

            <DropdownMenu>
                <DropdownMenuTrigger className="cursor-pointer bg-muted text-muted-foreground flex justify-center items-center gap-2 px-4 py-2 rounded-md hover:bg-orange hover:text-background transition-colors w-full focus:outline-0"><Ellipsis /></DropdownMenuTrigger>
                <DropdownMenuContent className="bg-muted">
                    <DropdownMenuLabel>More actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="hover:!bg-input"><FlagTriangleRight/>Report</DropdownMenuItem>
                    <DropdownMenuItem className="hover:!bg-input"><Tag/>Dispute tag</DropdownMenuItem>
                    <DropdownMenuItem className="hover:!bg-input"><CircleX/>Close</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>


            <button
                className={`cursor-pointer text-background flex justify-center items-center gap-2 px-4 py-2 rounded-md hover:bg-orange transition-colors w-full ${postLiked ? 'bg-orange text-background' : 'bg-muted text-muted-foreground'}`}
                onClick={async () => {
                    setPostLiked(!postLiked);
                    try {
                        const result = await toggleLikePost(id);
                        if (!result.success) {
                            setPostLiked(postLiked);
                            toast.error('You must be logged in to like a post')
                            return
                        } else {
                            return;
                        }
                    } catch (error) {
                        setPostLiked(!postLiked);
                        console.error("Error toggling like:", error);
                        toast.error("Failed to toggle like");
                    }
                }}
            >
                <Heart size={20} />
            </button>

            <button
                className={`cursor-pointer text-background flex justify-center items-center gap-2 px-4 py-2 rounded-md hover:bg-orange transition-colors w-full ${postPinned ? 'bg-orange text-background' : 'bg-muted text-muted-foreground'}`}
                onClick={async () => {
                    setPostPinned(!postPinned);
                    try {
                        const result = await togglePinPost(id);
                        if (!result.success) {
                            setPostPinned(postPinned);
                            toast.error("You must be logged into pin a post")
                        } else {
                            toast.success(postPinned ? "Post unpinned" : "Post pinned");
                        }
                    } catch (error) {
                        setPostPinned(!postPinned);
                        console.error("Error toggling pin:", error);
                        toast.error("Failed to toggle pin");
                    }
                }}
            >
                <Pin size={20} />
            </button>
        </div>
    )
}