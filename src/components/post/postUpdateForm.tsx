'use client'

// IMPORTS 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useUser } from '@clerk/nextjs';

import { toast } from "sonner"
import { useState } from "react";



// CLERK



// TYPS 
interface PostIDFormProps {
    postId: string;
}

// COMPONENT
export default function PostUpdateForm(postId: PostIDFormProps) {

    // States 
    const [buttonText, setButtonText] = useState('Post Update');

    // handlers 
    interface handlePostUpdateEvent extends React.FormEvent<HTMLFormElement> { }
    const handlePostUpdate = (e: handlePostUpdateEvent): void => {
        setButtonText('Posting...');
        e?.preventDefault();

        const form = document.querySelector('form');
        if (!form) return;

        const formData = new FormData(form);
        const updateText = formData.get('updateText') as string;

        // Validate comment text
        if (!updateText || updateText.trim() === '') {
            return;
        }
        toast.success('Posting update...');

    }






    return (

        <div className="bg-muted p-2 mt-2 rounded-md">
            <p className="font-bold text-muted-foreground mb-2">Post an update</p>
            <form onSubmit={handlePostUpdate} className="flex bg-background rounded-md p-2 gap-2 w-full">
                <div id="Right" className="flex flex-col w-full">
                    <div id="Top" className="flex flex-col gap-0 mb-2">
                    </div>
                    <textarea
                        name="updateText"
                        required
                        className="mb-2 p-2 rounded-md   focus:outline-none focus:ring-1 focus:ring-orange"
                        placeholder="Write your update here"
                        rows={1}
                    />
                    <Button
                        type="submit"
                        className="self-end px-4 py-2 bg-orange opacity-80 text-white rounded-md hover:bg-orange hover:opacity-100 transition-colors cursor-pointer">
                        {buttonText}
                    </Button>
                </div>
            </form>
        </div>


    );
}




