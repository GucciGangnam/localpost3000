// IMPORTS 
import { CreditCard, KeyRound, GlobeLock } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { auth, clerkClient } from '@clerk/nextjs/server';
import { getUserInfo } from "../../actions/user";
import { redirect } from "next/navigation";
import { getPersonalPosts } from "@/app/actions/post";
import Card from "./card"


// TYPES 
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
export default async function Page() {

    const { userId } = await auth();
    if (!userId) {
        return redirect('/');
    }
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const myPosts = await getPersonalPosts();
    if (!myPosts.success) {
        console.log("Posts not found");
        return <div>Posts not found</div>;
    }



    return (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 w-full'>

            {myPosts?.data && myPosts.data.length > 0 ? (
                // Render posts if myPosts.data exists and has items
                myPosts.data.map((post) => (
                    <Card key={post.id} post={post as PersonalPostForClient} />
                ))
            ) : (
                // Render 'NO posts' if myPosts.data is empty or doesn't exist
                <>NO posts</>
            )}




        </div>
    )

}