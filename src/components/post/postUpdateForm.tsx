'use client'

// IMPORTS 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useUser } from '@clerk/nextjs';
import { CreateUpdate } from '@/app/actions/update'
import { toast } from "sonner"
import { useState } from "react";



// CLERK



// TYPS 
interface PostIDFormProps {
    postId: string;
}

// COMPONENT
export default function PostUpdateForm({ postId }: PostIDFormProps) {

    // States 
    const [buttonText, setButtonText] = useState('Post Update');

    // handlers 
    interface HandlePostUpdateEvent extends React.FormEvent<HTMLFormElement> {} // Renamed to avoid confusion with `extends`

    const handlePostUpdate = async (e: HandlePostUpdateEvent): Promise<void> => {
        e.preventDefault(); // Always prevent default form submission
    
        setButtonText('Posting...'); // Show loading state on button
    
        const form = e.currentTarget; // More reliable way to get the form element from the event
        // const form = document.querySelector('form'); // This works, but e.currentTarget is more direct
    
        const formData = new FormData(form);
        const updateText = formData.get('updateText') as string;
    
        // Basic validation
        if (!updateText || updateText.trim() === '') {
            setButtonText('Post Update'); // Reset button text
            return;
        }
        if (!postId) {
            toast.error('Error posting update. Please retry later'); // Should ideally not happen if hidden input is correct
            setButtonText('Post Update'); // Reset button text
            return;
        }
    
        // Show a loading toast
        const loadingToastId = toast.loading('Creating post update...');
    
        try {
            // Call your server action with the correct arguments
            const result = await CreateUpdate(postId, updateText);
    
            // Handle the response from the server action
            if (result.success) {
                toast.success(result.message || 'Post update created successfully!', { id: loadingToastId });
                // Optionally clear the textarea after successful post
                (form.elements.namedItem('updateText') as HTMLTextAreaElement).value = '';
            } else {
                // Show error message from the backend
                toast.error(result.error || 'Failed to create post update.', { id: loadingToastId });
            }
        } catch (error) {
            // Catch any unexpected network or client-side errors
            console.error('Frontend error during post update:', error);
            toast.error('An unexpected error occurred.', { id: loadingToastId });
        } finally {
            // Always reset button text
            setButtonText('Post Update');
        }
    };






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




