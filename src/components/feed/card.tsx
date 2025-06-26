
'use client'
//  IMPORTS 
import { Verified, NewspaperIcon, Speech, Calendar1, Tag, CircleSlash2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import CardButtons from "./card-buttons"
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import { isUserVerified } from "@/app/actions/user";

interface PostForClient {
    id: string;
    ownerId: string;
    owner: string; // This will now be the user's full name
    ownerAvatar: string; // New field for the avatar URL
    timeStamp: number;
    content: string;
    attachment: string | null;
    category: string;
    hotness: number;
}

// COMPONENT
export default function Card({ post }: { post: PostForClient }) {

    // Check if user is verified 
    const [userVerified, setUserVerfied] = useState(false);
    useEffect(() => {
        const checkUserVerified = async () => {
            const result = await isUserVerified(post.ownerId);
            setUserVerfied(result.success ? result.verified : false);
        }
        checkUserVerified();
    }, [post.ownerId]);


    const router = useRouter();
    const handleClickUser = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        router.push(`/profile/${post.ownerId}`);
    }

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



    return (
        <a href={`/post/${post.id}`} className={` cursor-pointer relative bg-muted flex p-2 gap-2 rounded-md w-full overflow-hidden ${post.attachment ? 'row-span-2' : 'row-span-1'}`}>
            <div id="left" className="pt-1">
                <Avatar onClick={handleClickUser}>
                    <AvatarImage src={post.ownerAvatar} />
                    <AvatarFallback>
                        {post.owner.split(" ").slice(0, 2).map(name => name[0]).join("").toUpperCase()}
                    </AvatarFallback>
                </Avatar>
            </div>
            <div id="right" className="flex flex-col gap-2 grow justify-between">
                <div id="right-top" className=" flex flex-col gap-2 ">
                    <div id="meta">

                        <span className="flex items-center gap-1">
                            <div onClick={handleClickUser} id="name" className="hover:underline w-fit">{post.owner}</div>
                            {userVerified && <Verified color="var(--orange)" size={14} />}

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
                    {post.attachment && post.attachment.startsWith("http") &&
                        <div
                            id="attachment"
                            className={`grow ${post.attachment ? 'flex items-center bg-cover rounded-md' : ''} ${post.attachment ? 'sm:max-h-50 sm:overflow-hidden' : ''
                                }`}
                        >
                            <img src={post.attachment} alt="Attachment" className="rounded-md" />
                        </div>
                    }
                </div>
                <div id="right-bottom" className="relative flex justify-end gap-2">
                    {/* EXPORT THIS SECTION INTO A CLIENT COMPOENT SO THEY CAN BE BUTTONS WITH EVENT HANDLER */}
                    <CardButtons postID={post.id} />
                    {/* EXPORT THIS SECTION INTO A CLIENT COMPOENT SO THEY CAN BE BUTTONS WITH EVENT HANDLER */}
                </div>
            </div>
        </a>
    )
}