
'use client'
// IMPORTS 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, CircleX } from "lucide-react";
import { toggleLikeComment, checkCommentLiked, deleteComment } from "@/app/actions/comment";
import React from "react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


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

    const { user } = useUser();


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

    const handleDeleteComment = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {

        e.preventDefault();
        toast("Deleting comment...");
        try {
            const response = await deleteComment(comment.id);
            if (response.success) {
                toast.dismiss();
                toast.success("Comment deleted successfully!");
            } else {
                console.error("Failed to delete comment:", response.error);
                toast.error(`Error deleting comment: ${response.error}`);
            }
        } catch (error) {
            console.error("Error deleting comment:", error);
            toast.error("An error occurred while deleting the comment.");
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



            <div className="flex flex-col justify-between items-center">

                <button
                    onClick={handleToggleLike}
                    id="Right"
                    className={`h-fit flex flex-col items-center justify-center rounded-md p-2 cursor-pointer transition duration-200 ${commentLiked ? "bg-orange opacity-80 hover:opacity-100 text-background" : "hover:bg-orange group"
                        }`}
                >
                    <Heart className={`transition duration-200 ${commentLiked ? "text-background" : "group-hover:text-white"}`} />
                    <span className={`text-xs transition duration-200 ${commentLiked ? "text-background" : "text-muted-foreground group-hover:text-white"}`}>
                        {comment.likeCount}
                    </span>
                </button>

                {user?.id === comment.userId &&
                    // <button
                    //     id="Right"
                    //     className={`h-fit flex flex-col items-center justify-center rounded-md p-2 cursor-pointer transition duration-200 hover:text-background hover:bg-destructive opacity-50`}>
                    //     <CircleX className={`transition duration-200 `} />
                    // </button>

                    <AlertDialog>
                        <AlertDialogTrigger className="p-2 hover:bg-destructive hover:opacity-50 hover:text-background  rounded-md cursor-pointer "><CircleX className={`transition duration-200 `} /></AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure you want to delete this comment?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action can not be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteComment} className=" cursor-pointer bg-destructive opacity-50 hover:bg-destructive hover:opacity-100">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                }

            </div>





        </div>
    );
}



