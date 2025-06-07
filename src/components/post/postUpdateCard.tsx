// IMPORTS 
import { Megaphone, Verified } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"


// TYPES
interface Update {
    id: string,
    created_at: Date,
    content_text: string
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
        <div className={` cursor-pointer relative bg-muted flex p-2 gap-2 rounded-md w-full mt-2`}>
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
                            <div id="name">{post.owner}</div>
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
                <div id="right-bottom" className="relative flex justify-end gap-2">
                </div>
            </div>
        </div>
    )
}