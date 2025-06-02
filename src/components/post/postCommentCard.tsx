
'use client'
// IMPORTS 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart } from "lucide-react";
import { toggleLikeComment, checkCommentLiked } from "@/app/actions/comment";
import React from "react";
import { toast } from "sonner";
import { useState, useEffect } from "react";


// TYPES 
interface CommentForClient {
    id: string;
    userId: string;
    userName: string; // Full name of the user
    userAvatar: string; // URL of the user's avatar
    commentText: string;
    createdAt: string;
    likeCount: number;
    // postId: string; // I dont think teh clien tneeds this...?
}


export default function PostCommentCard(comment: CommentForClient) {


    // format times //
    const timestamp = new Date(comment.createdAt).getTime(); // Convert createdAt to a timestamp
    const utcTimeNow = new Date().getTime();
    const timeDifference = utcTimeNow - timestamp
    const timeDifferenceInMinutes = Math.floor(timeDifference / (1000 * 60));
    let timeAgo = "";
    if (timeDifferenceInMinutes < 1) {
        timeAgo = "Just now";
    } else if (timeDifferenceInMinutes < 60) {
        timeAgo = `${timeDifferenceInMinutes} minutes ago`;
    } else if (timeDifferenceInMinutes < 1440) {
        const timeDifferenceInHours = Math.floor(timeDifferenceInMinutes / 60);
        timeAgo = `${timeDifferenceInHours} hours ago`;
    } else if (timeDifferenceInMinutes < 10080) {
        const timeDifferenceInDays = Math.floor(timeDifferenceInMinutes / 1440);
        timeAgo = `${timeDifferenceInDays} days ago`;
    } else if (timeDifferenceInMinutes < 43200) {
        const timeDifferenceInWeeks = Math.floor(timeDifferenceInMinutes / 10080);
        timeAgo = `${timeDifferenceInWeeks} weeks ago`;
    } else if (timeDifferenceInMinutes < 525600) {
        const timeDifferenceInMonths = Math.floor(timeDifferenceInMinutes / 43200);
        timeAgo = `${timeDifferenceInMonths} months ago`;
    } else {
        const timeDifferenceInYears = Math.floor(timeDifferenceInMinutes / 525600);
        timeAgo = `${timeDifferenceInYears} years ago`;
    }

    // HANDLE TOGGLE LIKE   

    // FIRST CHECK IF COMMENT IS LIKED BY THE USER
    const [commentLiked, setCommentLiked] = useState(false);
    useEffect(() => {
        const checkLikeStatus = async () => {
            try {
                const liked = await checkCommentLiked(comment.id);
                setCommentLiked(liked);
            } catch (error) {
                console.error("Error checking like status:", error);
            }
        };
        checkLikeStatus();

    }, [comment.id]);

// HHANDLERS 
    interface ToggleLikeCommentResponse {
        success: boolean;
        error?: string;
    }
    interface ToggleLikeEvent extends React.MouseEvent<HTMLButtonElement> { }

    const handleToggleLike = async (e: ToggleLikeEvent): Promise<void> => {
        e.preventDefault();
        setCommentLiked(!commentLiked);
        const response: ToggleLikeCommentResponse = await toggleLikeComment(comment.id);
        if (response.success) {
            toast.success("Like toggled successfully!");
        }
        else {
            setCommentLiked(!commentLiked);
            console.error("Error toggling like:", response.error);
            toast.error(`Error toggling like: ${response.error}`);
        }
    }









    return (
        <div className="p-4 bg-background rounded-md flex gap-2">

            <div id="Left">
                <Avatar>
                    <AvatarImage src={comment.userAvatar} />
                    <AvatarFallback>
                        {comment.userName.split(" ").slice(0, 2).map(name => name[0]).join("").toUpperCase()}
                    </AvatarFallback>
                </Avatar>
            </div>

            <div id="Mid" className="flex flex-col gap-2 grow justify-between">
                <div id="Top" className="flex flex-col">
                    <p className="font-bold">{comment.userName}</p>
                    <p className="text-xs text-muted-foreground">{timeAgo}</p>
                </div>
                <div id="comment">
                    {comment.commentText}
                </div>
            </div>
            <button
                onClick={handleToggleLike}
                id="Right"
                className={`h-fit flex flex-col items-center justify-center rounded-md p-2 cursor-pointer transition duration-200 ${
                    commentLiked ? "bg-orange opacity-80 text-background" : "hover:bg-orange group"
                }`}
            >
                <Heart className={`transition duration-200 ${commentLiked ? "text-background" : "group-hover:text-white"}`} />
                <span className={`text-xs transition duration-200 ${commentLiked ? "text-background" : "text-muted-foreground group-hover:text-white"}`}>
                    {comment.likeCount}
                </span>
            </button>
        </div>
    );
}



