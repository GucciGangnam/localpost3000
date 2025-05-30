'use cient'
// IMPORTS 
import { Heart, MessageSquare, Waypoints, Pin, Ellipsis } from "lucide-react"
import { useState, useEffect } from "react";
import { checkPostPinned } from "@/app/actions/post";
import { toggleLikePost } from "@/app/actions/post";
import { checkPostLiked } from "@/app/actions/post";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { togglePinPost } from "@/app/actions/post";
import { toast } from "sonner"





// TYPES 
interface CardButtonsProps {
    postID: string;
}


// COMPONENT
export default function CardButtons({ postID }: CardButtonsProps) {

    // Post Boosted?

    // Post liked? 
    const [postLiked, setPostLiked] = useState(false);

    // Post Pinned?
    const [postPinned, setPostPinned] = useState(false);

    useEffect(() => {
        const fetchPinnedStatus = async () => {
            try {
                const isPinned = await checkPostPinned(postID);
                setPostPinned(isPinned);
            } catch (error) {
                console.error("Error checking pinned status:", error);
            }
        };
        fetchPinnedStatus();
    }, [postID]);
    useEffect(() => {
        const fetchLikedStatus = async () => {
            try {
                // Assuming you have a function to check if the post is liked
                // This function should return a boolean indicating if the post is liked by the user
                const isLiked = await checkPostLiked(postID);
                setPostLiked(isLiked);
            } catch (error) {
                console.error("Error checking liked status:", error);
            }
        };
        fetchLikedStatus();
    }, [postID]);


    //HANDLE BUTTON CLICKS
    const handlePinClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Button clicked");
        console.log("postID value:", postID); // This will now correctly log the string
        setPostPinned(!postPinned); // Toggle the pinned state
        togglePinPost(postID)
            .then((response) => {
                if (response.success) {
                    // Use the specific message provided by the backend action
                    toast.success(response.message || "Operation successful!");
                } else {
                    console.error("Error toggling pin status:", response.error);
                    toast.error(response.error || "Failed to toggle pin status.");
                }
            })
            .catch((error) => {
                console.error("Network or unexpected error:", error);
                toast.error("An unexpected error occurred. Please try again.");
            });
    }

    const handleLikeClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        console.log("Button clicked");
        console.log("postID value:", postID); // This will now correctly log the string
        setPostLiked(!postLiked); // Toggle the liked state
        toggleLikePost(postID)
            .then((response) => {
                if (response.success) {
                    // Use the specific message provided by the backend action
                    toast.success(response.message || "Operation successful!");
                } else {
                    console.error("Error toggling like status:", response.error);
                    toast.error(response.error || "Failed to toggle like status.");
                }
            })
            .catch((error) => {
                console.error("Network or unexpected error:", error);
                toast.error("An unexpected error occurred. Please try again.");
            });
    };

    return (
        <>

            <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-0 text-input hover:text-orange"><Ellipsis /></DropdownMenuTrigger>
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

            <button
                onClick={handleLikeClick}
                className={`rounded-md p-1 transition-colors duration-200 flex justify-center items-center ${postLiked ? "text-orange" : "text-input"
                    } hover:text-orange`}
            >
                <Heart size={15} />
            </button>



            <button
                onClick={handlePinClick}
                className={`rounded-md p-1 transition-colors duration-200 flex justify-center items-center ${postPinned ? "text-orange" : "text-input"
                    } hover:text-orange`}
            >
                <Pin size={15} />
            </button>
        </>
    )



}