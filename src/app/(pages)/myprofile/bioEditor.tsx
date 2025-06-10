'use client'

// IMPORTS
import { useState } from 'react';
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { updateBio } from '@/app/actions/user'; // Adjust this path if your updateBio action is in a different location

export default function BioEditor({ bio }: { bio: string | null }) {
    const [newBio, setNewBio] = useState(bio ?? "");
    const [isSaving, setIsSaving] = useState(false); // State for loading indicator
    const [dialogOpen, setDialogOpen] = useState(false); // State to control dialog open/close

    const handleBioChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNewBio(event.target.value);
    };

    // handlers
    const handleSaveNewBio = async () => {
        setIsSaving(true); // Set loading state to true
        try {
            // Call the server action with the new bio text
            const result = await updateBio(newBio);

            if (result.success) {
                console.log("Bio updated successfully:", result.message);
                setDialogOpen(false);
            } else {
                console.error("Failed to update bio:", result.error);
                // Optionally, show an error toast/notification here
            }
        } catch (error) {
            console.error("An unexpected error occurred:", error);
            // Show a generic error message
        } finally {
            setIsSaving(false); // Reset loading state
        }
    }

    return (
        // Add `open` and `onOpenChange` to control the dialog
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
                className="bg-muted px-2 py-1 rounded-sm text-muted-foreground text-sm cursor-pointer hover:bg-input"
                onClick={() => setDialogOpen(true)} // Open dialog when trigger is clicked
            >
                Edit Bio
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit your bio</DialogTitle>
                    <DialogDescription>
                        Update your public profile bio.
                    </DialogDescription>
                    <textarea
                        className="focus:outline-0 p-2 border border-gray-300 rounded-md"
                        value={newBio}
                        onChange={handleBioChange}
                        rows={5}
                    ></textarea>
                    <Button onClick={handleSaveNewBio} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save"}
                    </Button>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}