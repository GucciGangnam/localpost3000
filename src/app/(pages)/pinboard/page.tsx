
// IMPORTS 
import { getPinnedPosts } from "@/app/actions/post";
import Card from '@/components/feed/card';
import { Pin } from "lucide-react";

// Types 
interface PostForClient {
    id: string;
    ownerId: string;
    owner: string;
    ownerAvatar: string;
    timeStamp: number;
    content: string;
    attachment: string | null;
    category: string;
    hotness: string;
}


export default async function Page() {

    // Fetch pinned posts
    const pinnedPosts = await getPinnedPosts();

    // Check if there are no pinned posts
    if (!pinnedPosts.success || !pinnedPosts.data || pinnedPosts.data.length === 0) {
        return (
            <div className="p-4 flex justify-center items-center flex-col gap-4 rounded-md">
                <p>You haven&#39;t pinned any posts to your pinboard yet</p>
                <Pin/>
                <a href="/feed" className="bg-input hover:bg-muted text-muted-foreground px-4 py-2 rounded-md transition-colors">
                    Explore some posts
                </a>
            </div>
        );
    }

    return (
        <div>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 w-full'>
                {pinnedPosts.data.map((post: PostForClient) => (
                    <Card key={post.id} post={post} />
                ))}
            </div>
        </div>
    );
}