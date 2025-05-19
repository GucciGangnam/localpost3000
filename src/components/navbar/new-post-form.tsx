
//IMPORTS 
import { useEffect } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "../ui/dialog";
import { useUser } from "@clerk/nextjs";
import { Button } from "../ui/button";
import { Textarea } from "@/components/ui/textarea"
import { Speech, NewspaperIcon, Tag, Calendar1 } from "lucide-react";
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


//COMPONENT

export default function NewPostForm() {

    const { user, isLoaded } = useUser();
    const userName = isLoaded ? user?.fullName : "User Name"
    const userImage = isLoaded ? user?.imageUrl : "/default-avatar.png"
    // Get users coordinates 
    const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number }>({ latitude: 0.0, longitude: 0.0 });
    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;
                    setCoordinates({ latitude, longitude });
                    console.log('Latitude:', latitude);
                    console.log('Longitude:', longitude);
                },
                (error) => {
                    console.error('Error getting location:', error);
                }
            );
        } else {
            console.error('Geolocation is not supported by this browser.');
        }
    }
    // Call getLocation when the component mounts
    useEffect(() => {
        getLocation();
    }, []);



    // Newpost states 
    const [newPostContent, setNewPostContent] = useState('');
    // New Post Handlers 
    const handleChangePostContent = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNewPostContent(e.target.value);
    }
    const submitNewPost = async () => {
        if (newPostContent.length < 1) {
            return;
        }
        console.log(newPostContent.length)
        console.log("New post submitted:", newPostContent, coordinates);
        if (user) {
            try {
                let response = await createPost(user.id, newPostContent, coordinates);
                console.log(response)
            } catch (err) {
                console.error("Error creating post:", err);
            }
        } else {
            redirect("/");
        }
        setNewPostContent('');
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
                    <Textarea maxLength={140} value={newPostContent} onChange={handleChangePostContent} />
                </div>

                <Select >
                    <SelectTrigger className="w-fit">
                        <SelectValue placeholder="Tag" className="text-red-muted" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem className="hover:bg-muted flex flex-row-reverse" value="news">
                            <NewspaperIcon />
                            News
                        </SelectItem>
                        <SelectItem className="hover:bg-muted" value="discussion"><Speech />Discussion</SelectItem>
                        <SelectItem className="hover:bg-muted" value="event"><Calendar1 />Event</SelectItem>
                        <SelectItem className="hover:bg-muted" value="commercial"><Tag />Commercial</SelectItem>
                    </SelectContent>
                </Select>

                <div id="bottom" className="w-fill flex justify-between items-center">
                    <button className="bg-muted px-4 rounded-sm text-muted-foreground hover:bg-input">Add photo</button>
                    <DialogTrigger onClick={submitNewPost} className="bg-orange text-white px-3 py-1.5 rounded-md hover:bg-orange hover:opacity-80">
                        Post
                    </DialogTrigger>
                </div>
            </div>
        </DialogContent>
    )
}