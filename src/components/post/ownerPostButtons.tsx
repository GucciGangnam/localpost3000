'use client'
// IMPORT
import { Radio, X } from "lucide-react"
import { deletePost } from "@/app/actions/post"
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
import { useRouter } from 'next/navigation';



export default function OwnerPostButtons({ id }: { id: string }) {
    const router = useRouter();

    const handleDelete = async () => {
        try {
            const response = await deletePost(id);
            if (response.success) {
                toast.success("Post deleted successfully");
                router.push('/myposts');
            } else {
                console.error("Failed to delete post:", response.error);
                toast.error("An error occurred while deleting the post.", {
                    description: response.error || "Unknown error"
                });
            }
        } catch (error) {
            console.error("Error deleting post:", error);
            toast.error("An error occurred while deleting the post. Please try again later.");
        }
    };

    const handleBoost = () => { 
        alert("boost post clickd")
    }


    return (
        <div className="flex gap-2 justify-evenly items-center mb-2 rounded-md">

            <AlertDialog>
                <AlertDialogTrigger
                    className={`cursor-pointer bg-muted text-muted-foreground flex justify-center items-center gap-2 px-4 py-2 rounded-md hover:bg-orange hover:text-background transition-colors w-full`}>
                    <Radio size={20} />
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Boost this post</AlertDialogTitle>
                        <AlertDialogDescription>
                            Boost this post to increase its radius to 1.5km
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleBoost} className="bg-orange opacity-50 hover:bg-orange hover:opacity-100">Boost</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
                <AlertDialogTrigger
                    className={`cursor-pointer bg-muted text-muted-foreground flex justify-center items-center gap-2 px-4 py-2 rounded-md hover:bg-destructive hover:opacity-50  hover:text-background transition-colors w-full`}>
                    <X size={20} />
                </AlertDialogTrigger>
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
    )
}