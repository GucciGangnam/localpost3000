'use client'

// IMPORTS 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useUser } from '@clerk/nextjs';
import { createComment } from "@/app/actions/comment";
import { toast } from "sonner"
import { useState } from "react";



// CLERK
import {
    SignInButton,
    SignUpButton,
} from '@clerk/nextjs'




// TYPS 
interface PostIDFormProps {
    postId: string;
}

// COMPONENT
// COMPONENT
export default function PostCommentForm({ postId }: PostIDFormProps) { // Destructure postId directly
    const { user } = useUser();
    const [buttonText, setButtonText] = useState('Comment');

    if (!user) {
        return (
            <div className="p-4">
                <div className="flex flex-col gap-1">
                    You need to be logged in to comment on posts.
                    <SignUpButton mode="modal">
                        <Button className="cursor-pointer">Sign up</Button>
                    </SignUpButton>
                    <SignInButton mode="modal">
                        <Button className="cursor-pointer">Log in</Button>
                    </SignInButton>
                </div>
            </div>
        );
    }
    // Get user data
    const userAvatarUrl = user.imageUrl || '/default-avatar.png'; // Default avatar if not set
    const userName = user.fullName || "User Name"; // Default name if not set

    // handlers
    interface CreateCommentResponse {
        success: boolean;
        error?: string;
    }

    const handleSubmitComment = (e: React.FormEvent<HTMLFormElement>): void => {
        setButtonText('Posting...');
        e.preventDefault(); // Keep this! It prevents default form submission behavior

        // Get the form element directly from the event
        const form = e.currentTarget;

        const formData = new FormData(form);
        const commentText = formData.get('commentText') as string;

        // console.log("Comment Text:", commentText); // For debugging: check what's being extracted

        // Validate comment text
        if (!commentText || commentText.trim() === '') {
            toast.error('Comment cannot be empty.'); // Provide user feedback
            setButtonText('Comment'); // Reset button text
            return; // Exit if validation fails
        }

        toast.success('Posting comment...');
        // Call the createComment function with postId and commentText
        createComment(postId, commentText) // Use postId directly
            .then((response: CreateCommentResponse) => {
                setButtonText('Comment');
                toast.dismiss(); // Dismiss the "Posting comment..." toast
                if (response.success) {
                    toast.success('Comment created successfully!');
                    form.reset(); // Reset the form after successful submission
                } else {
                    toast.error(`Error: ${response.error}`);
                }
            })
            .catch((error: unknown) => {
                setButtonText('Comment'); // Reset button text on error
                console.error('Error creating comment:', error);
                toast.error('An error occurred while creating the comment.');
            });
    };

    return (
        <form onSubmit={handleSubmitComment} className="flex bg-background rounded-md p-2 gap-2 w-full">
            <Avatar>
                <AvatarImage src={userAvatarUrl} />
                <AvatarFallback>
                    {userName.split(" ").slice(0, 2).map((name: string) => name[0]).join("").toUpperCase()}
                </AvatarFallback>
            </Avatar>

            <div id="Right" className="flex flex-col w-full">
                <div id="Top" className="flex flex-col gap-0 mb-2">
                    <p className="font-bold">{userName}</p>
                    <p className="text-xs text-muted-foreground">Just now</p>
                </div>

                <textarea
                    name="commentText" // This is crucial for FormData
                    required
                    className="mb-2 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-orange"
                    placeholder="Write a comment..."
                    rows={1}
                />

                <Button
                    type="submit"
                    className="self-end px-4 py-2 bg-orange opacity-80 text-white rounded-md hover:bg-orange hover:opacity-100 transition-colors cursor-pointer"
                >
                    {buttonText}
                </Button>
            </div>
        </form>
    );
}