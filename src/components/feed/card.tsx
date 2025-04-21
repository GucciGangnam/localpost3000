//  IMPORTS 
import { Heart, MessageSquare, Waypoints, Pin, Verified, NewspaperIcon, Speech, Calendar1, Tag } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type cardProps = { 
    owner: string;
    timeStamp: number;
    content: string;
    attachment: string | null;
    category: string;
}


// COMPONENT
export default function Card({post}: { post: cardProps }) {

    const utcTimeNow = new Date().getTime();
    const timeDifference = utcTimeNow - post.timeStamp;
    const timeDifferenceInMinutes = Math.floor(timeDifference / (1000 * 60));
    // If the time difference is less than 1 minute, show "Just now"
    // if the time difference is less than 1 hour, show "X minutes ago"
    // if the time difference is less than 1 day, show "X hours ago"
    // if the time difference is less than 1 week, show "X days ago"
    // if the time difference is less than 1 month, show "X weeks ago"
    // if the time difference is less than 1 year, show "X months ago"
    // if the time difference is more than 1 years ago show "over a year ago"
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
        <div className={`relative bg-muted flex p-2 gap-2 rounded-md ${post.attachment ? 'row-span-2' : 'row-span-1'}`}>

            {post.category === "news" && <NewspaperIcon color="var(--orange)" size={20} className="absolute right-1 opacity-100" />}
            {post.category === "discuss" && <Speech color="var(--orange)" size={20} className="absolute right-1 opacity-100" />}
            {post.category === "event" && <Calendar1 color="var(--orange)" size={20} className="absolute right-1 opacity-100" />}
            {post.category === "commercial" && <Tag color="var(--orange)" size={20} className="absolute right-1 opacity-100" />}





            <div id="left" className="pt-1">
                <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
            </div>

            <div id="right" className="flex flex-col gap-2 grow justify-between">
                <div id="right-top" className=" flex flex-col gap-2 ">
                    <div id="meta">
                        <span className="flex items-center gap-2"><div id="name">{post.owner}</div> <div><Verified size={20} fill="var(--orange)" color="var(--background)" /></div></span>
                        <div id="timestamp" className="text-xs text-muted-foreground">{timeAgo}</div>
                    </div>
                </div>
                <div id="right-middle" className=" flex flex-col gap-2 grow">
                    <div id="content">
                        {post.content}
                    </div>
                    {/* Attachments */}
                    {post.attachment && post.attachment.startsWith("http") &&
                        <div
                            id="attachment"
                            className={`grow ${post.attachment ? 'flex items-center bg-cover rounded-md' : ''} ${
                                post.attachment ? 'sm:max-h-50 sm:overflow-hidden' : ''
                            }`}
                        >
                            <img src={post.attachment} alt="Attachment" className="rounded-md" />
                        </div>
                    }


                </div>


                <div id="right-bottom" className="flex justify-end gap-4">
                    <Waypoints
                        fill="var(--input)"
                        color="var(--input)"
                    />
                    <MessageSquare
                        fill="var(--input)"
                        color="var(--input)"
                    />
                    <Heart
                        fill="var(--input)"
                        color="var(--input)"
                    />
                    <Pin
                        fill="var(--input)"
                        color="var(--input)"
                    />
                </div>
            </div>


        </div>
    )
}