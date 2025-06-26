// IMPORTS 
import { auth, clerkClient } from '@clerk/nextjs/server';
import { redirect } from "next/navigation";
import { getPersonalPosts } from "@/app/actions/post";
import Card from "./card"
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import NewPostDialog from "@/components/navbar/new-post-dialog";


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

    const userAvatar = user.imageUrl;

    console.log(myPosts.postCount);



    return (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 w-full'>

            <div id="Info" className="bg-muted rounded-md p-2 flex flex-col items-center gap-4">
                <div id="top" className="font-bold w-full flex gap-4 items-center">
                    <Avatar className="w-8 h-8">
                        <AvatarImage src={userAvatar} />
                        <AvatarFallback>
                            {user.firstName?.split(" ").slice(0, 2).map(name => name[0]).join("").toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    Your Posts
                </div>
                <div id="mid" className="flex w-full justify-around items-center gap-4">
                    <div id="Posts-Made" className=" h-full flex flex-col items-center justify-center bg-input rounded-md p-1 px-2 gap-1 text-muted-foreground min-w-max aspect-square">
                        <div id="NumberOfPostsMade" className="text-4xl font-bold">
                            {myPosts.postCount?.postsMade}
                        </div>
                        <div className="text-xs text-muted-foreground ">
                            Posts made
                        </div>
                    </div>
                    <div id="Posts-Available" className=" h-full flex flex-col items-center justify-center bg-input rounded-md p-1 px-2 gap-1 text-muted-foreground min-w-max aspect-square">
                        <div id="NumberOfPostsAvailable" className="text-4xl font-bold">
                        {myPosts.postCount?.postsAvailable}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Posts available
                        </div>
                    </div>
                </div>
                <div id="bot" className="w-full flex justify-center items-center">
                    <Button className="bg-input hover:bg-orange cursor-pointer text-primary hover:text-background w-full">Get more posts</Button>
                </div>
            </div>

            {myPosts?.data && myPosts.data.length > 0 ? (
                // Render posts if myPosts.data exists and has items
                myPosts.data.map((post) => (
                    <Card key={post.id} post={post as PersonalPostForClient} />
                ))
            ) : (
                // Render 'NO posts' if myPosts.data is empty or doesn't exist
                <div className="bg-muted rounded-md p-4 flex flex-col items-center justify-center gap-4 w-full">
                    <p>You haven&#39;t made any posts yet.</p>
                    <NewPostDialog />
                </div>
            )}




        </div>
    )

}