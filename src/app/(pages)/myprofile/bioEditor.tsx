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
import { toast } from "sonner" // Assuming 'sonner' is installed for toasts

// Define the maximum allowed characters for the bio
const MAX_BIO_LENGTH = 500;

export default function BioEditor({ bio }: { bio: string | null }) {
    const [newBio, setNewBio] = useState(bio ?? "");
    const [isSaving, setIsSaving] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    // Calculate the current character count
    const charCount = newBio.length;

    const handleBioChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = event.target.value;
        // The maxLength attribute will prevent typing beyond 500,
        // but this ensures the state also doesn't go over if there's any edge case.
        if (value.length <= MAX_BIO_LENGTH) {
            setNewBio(value);
        }
    };

    const handleSaveNewBio = async () => {
        setIsSaving(true);
        try {
            // It's good practice to trim whitespace from ends before saving
            const bioToSave = newBio.trim();

            // Basic client-side validation before sending to server
            if (bioToSave.length > MAX_BIO_LENGTH) {
                toast.error(`Bio exceeds maximum ${MAX_BIO_LENGTH} characters.`);
                setIsSaving(false);
                return; // Stop execution
            }
            if (bioToSave.length === 0) {
                 toast.error("Bio cannot be empty.");
                 setIsSaving(false);
                 return;
            }


            const result = await updateBio(bioToSave); // Pass the trimmed bio

            if (result.success) {
                console.log("Bio updated successfully:", result.message);
                toast.success("Bio updated successfully!");
                setDialogOpen(false);
            } else {
                console.error("Failed to update bio:", result.error);
                toast.error(`Failed to update bio: ${result.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error("An unexpected error occurred:", error);
            toast.error("An unexpected error occurred while saving.");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
                className="bg-muted px-2 py-1 rounded-sm text-muted-foreground text-sm cursor-pointer hover:bg-input"
                onClick={() => setDialogOpen(true)}
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
                        className="focus:outline-0 p-2 border border-gray-300 rounded-md w-full" // Added w-full for full width
                        value={newBio}
                        onChange={handleBioChange}
                        rows={5}
                        maxLength={MAX_BIO_LENGTH} // HTML attribute to limit input
                    ></textarea>
                    <div className="text-sm text-right text-muted-foreground">
                        <span className={charCount > MAX_BIO_LENGTH ? "text-red-500" : ""}>
                            {charCount}
                        </span>/{MAX_BIO_LENGTH} characters
                    </div>
                    <Button onClick={handleSaveNewBio} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save"}
                    </Button>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}