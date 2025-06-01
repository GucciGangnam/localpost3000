// IMPORTS 

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { currentUser } from '@clerk/nextjs/server'
import { createComment } from "@/app/actions/comment"
import { toast } from "sonner"


// TYPS 
interface PostIDFormProps {
    postId: string;
}

// COMPONENT
export default async function PostCommentForm(postId: PostIDFormProps) {


    const user = await currentUser();

    if (!user) {
        return <div className="p-4">You must be logged in to comment.</div>;
    }

    // Access the user's avatar URL
    const userAvatarUrl = user.imageUrl;
    const userName = user.fullName || user.firstName || "Unknown User";







    return (
        <form className="flex bg-background rounded-md p-4 gap-2 w-full">

            <Avatar>
                <AvatarImage src={userAvatarUrl} />
                <AvatarFallback>
                    {userName.split(" ").slice(0, 2).map(name => name[0]).join("").toUpperCase()}
                </AvatarFallback>
            </Avatar>

            <div id="Right" className="flex flex-col w-full">

                <div id="Top" className="flex flex-col gap-0 mb-2">
                    <p className="font-bold">{userName}</p>
                    <p className="text-xs text-muted-foreground">Just now</p>
                </div>

                <textarea
                    name="commentText"
                    required
                    className="mb-2 p-2 rounded-md   focus:outline-none focus:ring-1 focus:ring-orange"
                    placeholder="Write a comment..."
                    rows={3}
                />

                <Button
                    type="submit"
                    className="self-end px-4 py-2 bg-orange opacity-80 text-white rounded-md hover:bg-orange hover:opacity-100 transition-colors cursor-pointer">
                    Comment
                </Button>

            </div>

        </form>
    );
}

