'use client'
// IMPORTS 
import { Megaphone, Verified, CircleX } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUser } from '@clerk/nextjs';
import { deleteUpdate } from '@/app/actions/update'
import { toast } from "sonner";
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
interface Update {
    id: string,
    created_at: Date,
    content_text: string;
    owner_id: string;
}

interface PostForClient {
    id: string;
    owner: string; // This will now be the user's full name
    ownerAvatar: string; // New field for the avatar URL
    timeStamp: number;
    content: string;
    attachment: string | null;
    category: string;
    hotness: number;
}

interface PostUpdateCardProps {
    post: PostForClient; // The entire post object
    update: Update;     // The entire update object
}


// COMPONENT 

export default function PostUpdateCard({ post, update }: PostUpdateCardProps) {

    const { user } = useUser();

    const handleDeleteUpdate = async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
        e.preventDefault();
        toast("Deleting comment...");
        try {
            const response = await deleteUpdate(update.id);
            if (response.success) {
                toast.dismiss();
                toast.success("Update deleted successfully!");
            } else {
                console.error("Failed to delete update:", response.error);
                toast.error(`Error deleting update: ${response.error}`);
            }
        } catch (error) {
            console.error("Error deleting comment:", error);
            toast.error("An error occurred while deleting the update.");
        }

    }

    const utcTimeNow = new Date().getTime();
    const timeDifference = utcTimeNow - update.created_at.getTime();
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

    return (
        <div className={` cursor-pointer relative bg-muted flex p-2 gap-2 rounded-md w-full mt-2 overflow-hidden`}>
            <div id="left" className="pt-1">
                <Avatar>
                    <AvatarImage src={post.ownerAvatar} />
                    <AvatarFallback>
                        {post.owner.split(" ").slice(0, 2).map(name => name[0]).join("").toUpperCase()}
                    </AvatarFallback>
                </Avatar>
            </div>
            <div id="right" className="flex flex-col gap-2 grow justify-between">
                <div id="right-top" className=" flex flex-col gap-2 ">
                    <div id="meta">

                        <span className="flex items-center gap-2">
                            <div id="name" className="font-bold">{post.owner}</div>
                            <div className=""><Verified size={20} fill="var(--orange)" color="var(--background)" /></div>
                            <div className=" flex justify-center items-center gap-1 text-xs text-muted-foreground p-0.5 px-1 rounded-sm bg-input">
                                <Megaphone color="var(--orange)" size={10} />
                                Update
                            </div>

                        </span>

                        <div id="timestamp" className="text-xs text-muted-foreground">{timeAgo}</div>
                    </div>
                </div>
                <div id="right-middle" className=" flex flex-col gap-2 grow">
                    <div id="content">
                        {update.content_text}
                    </div>
                </div>
            </div>
            {user?.id === update.owner_id &&
                <AlertDialog>
                    <AlertDialogTrigger className="p-2 text-muted-foreground hover:bg-destructive hover:opacity-50 hover:text-background  rounded-md cursor-pointer "><CircleX className={`transition duration-200 `} /></AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure you want to delete this update?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action can not be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteUpdate}  className=" cursor-pointer bg-destructive opacity-50 hover:bg-destructive hover:opacity-100">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            }
        </div>
    )
}