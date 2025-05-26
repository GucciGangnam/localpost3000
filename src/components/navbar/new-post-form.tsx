'use client'

//IMPORTS 
import { DialogTrigger, DialogContent, DialogTitle } from "../ui/dialog";
import { useUser } from "@clerk/nextjs";
import { Textarea } from "@/components/ui/textarea"
import { Speech, NewspaperIcon, Tag, Calendar1, CircleSlash2, MapPin } from "lucide-react";
import { useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
// ACTIONS 
import { createPost } from "@/app/actions/post";
import { redirect } from "next/navigation";
import { getLocation } from "@/lib/utils"
import { toast } from "sonner"


// TYPES 
type allowedTags = 'none' | 'news' | 'discuss' | 'event' | 'commercial';


//COMPONENT

export default function NewPostForm() {



    const { user, isLoaded } = useUser();
    const userName = isLoaded ? user?.fullName : "User Name"
    const userImage = isLoaded ? user?.imageUrl : "/default-avatar.png"

    // Newpost states 
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostTag, setNewPostTag] = useState<allowedTags>('none');
    // New Post Handlers 
    const handleChangePostContent = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNewPostContent(e.target.value);
    }
    const submitNewPost = async () => {
        toast("Creating post")
        if (newPostContent.length < 1) {
            return;
        }
        if (!user || !user.id) {
            redirect('/');
        }

        const location = await getLocation();
        if (!location) {
            redirect('/');
        }



        const response = await createPost(newPostContent, newPostTag, location);
        if (response.success) {
            setNewPostContent(''); // Clear the textarea after submission
            setNewPostTag('none'); // Reset the tag selection
            toast("Post created successfully")
        } else {
            console.error("Post creation failed:", response.error);
            toast("An error occurred while creating the post. Please try again later.", {
                description: response.error || "Unknown error"
            });
            return;
        }
    }



    return (
        <DialogContent aria-description={"New post"} className="flex">
            <div id="left">
                <img
                    src={userImage}
                    alt="Avatar"
                    className="rounded-full w-[35px] h-[35px]"
                    style={{ aspectRatio: "1/1", borderRadius: '100%' }}
                />
            </div>
            <div id="right" className=" grow flex flex-col gap-2">
                <div id="top">
                    <DialogTitle>{userName}</DialogTitle>
                    <div className="text-sm text-muted-foreground">Just now</div>
                </div>
                <div id="Text">
                    <Textarea placeholder="Write your post here" maxLength={140} value={newPostContent} onChange={handleChangePostContent} />
                </div>

                <Select onValueChange={(value) => setNewPostTag(value as allowedTags)}>
                    <SelectTrigger className="w-fit">
                        <SelectValue placeholder="Tag" className="text-red-muted" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem className="hover:bg-muted" value="none"><CircleSlash2 />None</SelectItem>
                        <SelectItem className="hover:bg-muted" value="news"><NewspaperIcon />News</SelectItem>
                        <SelectItem className="hover:bg-muted" value="discuss"><Speech />Discussion</SelectItem>
                        <SelectItem className="hover:bg-muted" value="event"><Calendar1 />Event</SelectItem>
                        <SelectItem className="hover:bg-muted" value="commercial"><Tag />Commercial</SelectItem>
                    </SelectContent>
                </Select>

                <div id="bottom" className="w-fill flex justify-between items-center">
                    <button className="bg-muted px-4 rounded-sm text-muted-foreground hover:bg-input">Add photo</button>

                    {newPostContent.length < 1 ? (
                        <button className="bg-orange text-white px-3 py-1.5 rounded-md hover:bg-orange hover:opacity-80">
                            Post
                        </button>
                    ) :
                        (
                            <DialogTrigger onClick={submitNewPost} className="bg-orange text-white px-3 py-1.5 rounded-md hover:bg-orange hover:opacity-80">
                                Post
                            </DialogTrigger>
                        )}
                </div>
                <div className="absolute bottom-1 right-5 flex items-center gap-1 text-xs text-destructive opacity-50">
                    Your post will be pinned at this exact location
                    <MapPin
                    size={15}
                    />
                </div>
            </div>
        </DialogContent>
    )
}