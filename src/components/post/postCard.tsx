

'use client'
//  IMPORTS 
import { Verified, NewspaperIcon, Speech, Calendar1, Tag, CircleSlash2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ShineBorder } from "@/components/magicui/shine-border";
import { useRouter } from 'next/navigation';
import Image from "next/image";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface PostForClient {
    id: string;
    ownerId: string; // This will now be the user's ID
    owner: string; // This will now be the user's full name
    ownerAvatar: string; // New field for the avatar URL
    timeStamp: number;
    content: string;
    attachment: string | null;
    category: string;
    hotness: string;
}

// COMPONENT
export default function PostCard({ post }: { post: PostForClient }) {

    const utcTimeNow = new Date().getTime();
    const timeDifference = utcTimeNow - post.timeStamp;
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

    // Initialize router
    const router = useRouter();
    // Redirect user on user name click 
    const handleClickUser = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        router.push(`/profile/${post.ownerId}`);
    }



    return (
        <div className={`cursor-pointer relative bg-muted flex p-2 gap-2 rounded-md w-full overflow-hidden ${post.attachment ? 'row-span-2' : 'row-span-1'}`}>
            <ShineBorder shineColor={'#FFB200'} duration={10} borderWidth={2} />
            <div id="left" className="pt-1">
                <Avatar onClick={handleClickUser} className="cursor-pointer">
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

                            <div id="name" className="font-bold hover:underline" onClick={handleClickUser}>{post.owner}</div>

                            <div className=" font-bold flex justify-center items-center gap-1 text-xs text-muted-foreground p-0.5 px-1 rounded-sm bg-input">
                                Orginal
                            </div>

                            <div className=""><Verified size={20} fill="var(--orange)" color="var(--background)" /></div>

                            {post.category === "none" &&
                                <div className=" flex justify-center items-center gap-1 text-xs text-muted-foreground p-0.5 px-1 rounded-sm bg-input">
                                    <CircleSlash2 color="var(--orange)" size={10} />
                                    None
                                </div>
                            }
                            {post.category === "news" &&
                                <div className=" flex justify-center items-center gap-1 text-xs text-muted-foreground p-0.5 px-1 rounded-sm bg-input">
                                    <NewspaperIcon color="var(--orange)" size={10} />
                                    News
                                </div>
                            }
                            {post.category === "discuss" &&
                                <div className="flex justify-center items-center gap-1 text-xs text-muted-foreground p-0.5 px-1 rounded-sm bg-input">
                                    <Speech color="var(--orange)" size={10} />
                                    Discuss
                                </div>
                            }
                            {post.category === "event" &&
                                <div className="flex justify-center items-center gap-1 text-xs text-muted-foreground p-0.5 px-1 rounded-sm bg-input">
                                    <Calendar1 color="var(--orange)" size={10} />
                                    Event
                                </div>
                            }
                            {post.category === "commercial" &&
                                <div className=" flex justify-center items-center gap-1 text-xs text-muted-foreground p-0.5 px-1 rounded-sm bg-input">
                                    <Tag color="var(--orange)" size={10} />
                                    Commercial
                                </div>
                            }
                            {!post.category &&
                                <div className=" flex justify-center items-center gap-1 text-xs text-muted-foreground p-0.5 px-1 rounded-sm bg-input">
                                    <Tag color="var(--orange)" size={10} />
                                    None
                                </div>
                            }
                        </span>

                        <div id="timestamp" className="text-xs text-muted-foreground">{timeAgo}</div>
                    </div>
                </div>
                <div id="right-middle" className=" flex flex-col gap-2 grow">
                    <div id="content">
                        {post.content}
                    </div>

                    {/* Attachments */}
                    {
                        post.attachment &&
                        post.attachment.startsWith('http') && (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <div
                                        id="attachment"
                                        className={`grow ${post.attachment ? 'flex items-center bg-cover rounded-md relative' : ''
                                            } ${post.attachment ? 'sm:max-h-50 sm:overflow-hidden' : ''}`}
                                        style={{ cursor: 'pointer' }} // Indicate clickable behavior
                                    >
                                        <div className="absolute text-muted text-center w-full hidden sm:block">Click image to view</div>
                                        <Image
                                            src={post.attachment}
                                            alt="Attachment"
                                            width={800} // <<< You NEED to provide a width
                                            height={600} // <<< You NEED to provide a height
                                            className="rounded-md"
                                        />
                                    </div>
                                </DialogTrigger>
                                <DialogContent className="w-screen max-w-[90vw] max-h-[90vh] h-fit flex flex-col justify-center items-center p-4 shadow-none">
                                    <DialogTitle></DialogTitle>
                                    <Image
                                        src={post.attachment}
                                        alt="Full screen attachment"
                                        className="object-contain w-full h-full max-w-[90vw] max-h-[90vh]"
                                        width={800} // <<< You NEED to provide a width
                                        height={600} // <<< You NEED to provide a height
                                    />
                                </DialogContent>
                            </Dialog>
                        )
                    }


                </div>
                <div id="right-bottom" className="relative flex justify-end gap-2">
                </div>
            </div>
        </div>
    )
}