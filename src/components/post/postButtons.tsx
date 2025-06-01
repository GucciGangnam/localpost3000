'use client'
// IMPORT
import { Heart, Waypoints, Pin } from "lucide-react"

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

            <button className="cursor-pointer bg-muted text-muted-foreground flex justify-center items-center gap-2 px-4 py-2 rounded-md hover:bg-orange transition-colors w-full">
                <Waypoints
                    size={20}
                />
            </button>


            <button 
                className={`cursor-pointer text-background flex justify-center items-center gap-2 px-4 py-2 rounded-md hover:bg-orange transition-colors w-full ${postLiked ? 'bg-orange text-background' : 'bg-muted text-muted-foreground'}`} 
                onClick={async () => {
                    setPostLiked(!postLiked);
                    try {
                        await toggleLikePost(id);
                        toast.success(postLiked ? "Post unliked" : "Post liked");
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
                        await togglePinPost(id);
                        toast.success(postPinned ? "Post unpinned" : "Post pinned");
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