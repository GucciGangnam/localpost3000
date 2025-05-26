'use client'

//  IMPORTS 
import { Verified, NewspaperIcon, Speech, Calendar1, Tag, CircleSlash2, MapPinned } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { deletePost } from "@/app/actions/post";
import { toast } from "sonner"

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


interface PersonalPostForClient {
    id: string;
    owner: string;
    ownerAvatar: string;
    created_at: Date;
    content: string;
    attachment: string | null;
    category: string;
    hotness: number;
    longitude: number;
    latitude: number;
}

// COMPONENT
export default function Card({ post }: { post: PersonalPostForClient }) {


    const handleDelete = async () => {
        try {
            const response = await deletePost(post.id)
            if (response.success) {
                toast("Post deleted sucesfully")
                return;
            } else {
                console.error("Failed to delete post:", response.error);
                toast("An error occurred while deleting the post. Please try again later.", {
                    description: response.error || "Unknown error"
                });
                return;
            }
        } catch (error) {
            console.error("Error deleting post:", error);
            toast("An error occurred while deleting the post. Please try again later.");
            return;
        }
    }



    return (
        <div className={` cursor-pointer relative bg-muted flex p-2 gap-2 rounded-md w-full ${post.attachment ? 'row-span-2' : 'row-span-1'}`}>
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

                        <div id="timestamp" className="text-xs text-muted-foreground">Posted on: {post.created_at.toLocaleString()}</div>
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
                <div id="right-bottom" className="flex flex-col gap-2">
                    <a
                        className=" text-xs flex items-center justify-center gap-1 py-5 p-2 pl-1 rounded-sm"
                        href={`https://www.google.com/maps/search/?api=1&query=${post.latitude},${post.longitude}`}
                        style={{
                            backgroundImage: `url('/mapDefaultBanner.png')`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' // Added box-shadow
                        }}
                        target="_blank" // This opens the link in a new tab
                        rel="noopener noreferrer" // Recommended for security with target="_blank"
                    >
                        Click to see where you placed this post
                    </a>
                    <AlertDialog>
                        <AlertDialogTrigger className=" p-1.5 text-primary-foreground rounded-md bg-orange opacity-30 hover:opacity-100">Delete</AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure you want to delete this post?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your post
                                    and all its associated data.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} className="bg-destructive opacity-50 hover:bg-destructive hover:opacity-100">Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>







        </div>
    )
}