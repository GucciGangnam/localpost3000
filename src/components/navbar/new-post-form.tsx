'use client'

// IMPORTS
import { DialogTrigger, DialogContent, DialogTitle } from "../ui/dialog";
import { useUser } from "@clerk/nextjs";
import { Textarea } from "@/components/ui/textarea"
import { Speech, NewspaperIcon, Tag, Calendar1, CircleSlash2, Info, ImageUp } from "lucide-react";
import React, { useRef, useState } from 'react';
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
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"

// IMPORT THE CLOUDINARY UPLOAD HELPER
import { uploadImageToCloudinary } from '@/lib/cloudinaryUpload';


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
    const [newPostAttachment, setNewPostAttachment] = useState<File | null>(null); // State for the file
    const [previewImage, setPreviewImage] = useState<string | null>(null); // State for image preview URL
    const fileInputRef = useRef<HTMLInputElement>(null); // Ref for the hidden file input
    const [isSubmitting, setIsSubmitting] = useState(false); // To prevent double submission

    // New Post Handlers
    const handleChangePostContent = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNewPostContent(e.target.value);
    }

    const handleImageClick = () => {
        fileInputRef.current?.click(); // Programmatically click the hidden file input
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Basic validation for image type and size
            if (!file.type.startsWith('image/')) {
                toast.error("Please select an image file.");
                setNewPostAttachment(null);
                setPreviewImage(null);
                return;
            }
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error("Image size too large (max 5MB).");
                setNewPostAttachment(null);
                setPreviewImage(null);
                return;
            }

            setNewPostAttachment(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setNewPostAttachment(null);
            setPreviewImage(null);
        }
    };

    const submitNewPost = async () => {
        if (isSubmitting) return; // Prevent multiple clicks

        if (newPostContent.length < 1) {
            toast.error("Post content cannot be empty.");
            return;
        }
        if (!user || !user.id) {
            toast.error("You must be logged in to create a post.");
            redirect('/');
            return;
        }

        setIsSubmitting(true);
        const submitToastId = toast.loading("Creating post...");

        try {
            const location = await getLocation();
            if (!location) {
                toast.error("Could not determine your location. Please try again.", { id: submitToastId });
                return;
            }

            let imageUrl: string | null = null;
            if (newPostAttachment) {
                toast.loading("Uploading image...", { id: submitToastId });
                imageUrl = await uploadImageToCloudinary(newPostAttachment);
            }

            const response = await createPost(newPostContent, newPostTag, location, imageUrl);

            if (response.success) {
                console.log("Post created successfully:", response.data);
                setNewPostContent('');
                setNewPostTag('none');
                setNewPostAttachment(null);
                setPreviewImage(null);
                toast.success("Post created successfully!", { id: submitToastId });
                redirect(`/post/${response.data.id}`);
            } else {
                console.error("Post creation failed:", response.error);
                toast.error("An error occurred while creating the post. Please try again later.", {
                    description: response.error || "Unknown error",
                    id: submitToastId
                });
            }
        } catch (error: any) {
            if (error && typeof error === 'object' && error.message && error.message.includes('NEXT_REDIRECT')) {
                throw error;
            }

            console.error("Error in submitNewPost:", error);
            toast.error("An unexpected error occurred.", {
                description: error.message || "Unknown error",
                id: submitToastId
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const MAX_CHARS = 140; // Define your max characters here

    return (
        <DialogContent aria-description={"New post"} className="flex">
            <div id="left" className="min-w-[35px]">
                <img
                    src={userImage}
                    alt="Avatar"
                    className="rounded-full w-[35px] h-[35px]"
                    style={{ aspectRatio: "1/1", borderRadius: '100%' }}
                />
            </div>
            <div id="right" className="grow flex flex-col gap-2 min-w-0">
                <div id="top" className="flex items-center gap-5">
                    <div>
                        <DialogTitle>{userName}</DialogTitle>
                        <div className="text-sm text-muted-foreground">Just now</div>
                    </div>

                    <Select onValueChange={(value) => setNewPostTag(value as allowedTags)} disabled={isSubmitting}>
                        <SelectTrigger className="w-fit bg-muted">
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

                </div>

                <div id="Text" className="w-full min-w-0">
                    <Textarea
                        placeholder="Write your post here"
                        maxLength={MAX_CHARS} // Use the defined constant here
                        value={newPostContent}
                        onChange={handleChangePostContent}
                        disabled={isSubmitting}
                        className="w-full resize-y break-words"
                    />
                    {/* Character Count Display */}
                    <div className="text-xs text-right mt-0.5"
                        style={{ color: newPostContent.length >= MAX_CHARS - 10 ? 'red' : 'inherit' }}> {/* Styles text red when near limit */}
                        {newPostContent.length}/{MAX_CHARS}
                    </div>
                </div>


                <div id="bottom" className="w-full flex justify-between items-center">

                    <div className="flex items-center gap-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            style={{ display: 'none' }}
                            disabled={isSubmitting}
                        />
                        <button
                            className="bg-muted rounded-sm text-muted-foreground hover:bg-input outline-1 outline-dashed flex items-center justify-center relative overflow-hidden w-8 h-8 cursor-pointer"
                            onClick={handleImageClick}
                            disabled={isSubmitting}
                        >
                            {previewImage ? (
                                <img
                                    src={previewImage}
                                    alt="Preview"
                                    className="object-cover rounded-sm w-full h-full"
                                />
                            ) : (
                                <ImageUp className="inline" size={16} />
                            )}
                        </button>

                        <div className="text-xs text-muted-foreground">Upload Photo</div>

                    </div>



                    {newPostContent.length < 1 || isSubmitting ? (
                        <button className="bg-orange text-white px-3 py-1.5 rounded-md opacity-50 cursor-not-allowed" disabled>
                            Post
                        </button>
                    ) :
                        (
                            <DialogTrigger onClick={submitNewPost} className="bg-orange text-white px-3 py-1.5 rounded-md hover:bg-orange hover:opacity-80">
                                Post
                            </DialogTrigger>
                        )}
                </div>




                <div className="absolute bottom-1 left-1 flex items-center gap-1 text-xs text-destructive opacity-50">
                    <HoverCard>
                        <HoverCardTrigger asChild>
                            <button><Info /></button>
                        </HoverCardTrigger>
                        <HoverCardContent>
                            Your post will be visible to everyone within 1km of this location. Nobody will be able to see your exact location.
                        </HoverCardContent>
                    </HoverCard>
                </div>

            </div>
        </DialogContent>
    )
}