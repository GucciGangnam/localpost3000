
// IMPORTS 
import Card from "@/components/feed/card";
import NoPostsFound from "@/components/feed/no-posts-found";
// ACTIONS
import { getAllPostsByNewest, getAllPostsByOldest, getAllPostsByHot } from "@/app/actions/post";
import { redirect } from 'next/navigation';
import { get } from "http";



interface PostForClient {
    id: string;
    owner: string; // This will now be the user's full name
    ownerAvatar: string; // New field for the avatar URL
    timeStamp: number;
    content: string;
    attachment: string | null;
    category: string;
    hotness: number;
}










export default async function FeedPage(
    { searchParams }: {
        searchParams: { filter: string, sort: string }
    }
) {

    // Get the current filter and sort from the URL
    const { filter, sort } = await searchParams;
    console.log("filter", filter)
    console.log("sort", sort)

    const filters = ['all', 'news', 'discuss', 'events', 'commercial'];
    const sorts = ['hot', 'newest', 'oldest'];
    // redirect user if the filter or sort is not valid
    if (!filters.includes(filter)) {
        redirect('/feed?filter=all&sort=hot')
    }
    if (!sorts.includes(sort)) {
        redirect('/feed?filter=all&sort=hot')
    }

    let posts: PostForClient[] = [];

    // --- Dynamic Post Fetching ---
    if (sort === 'newest') {
        const response = await getAllPostsByNewest(filter as 'all' | 'news' | 'discuss' | 'events' | 'commercial');
        posts = response.data ?? [];
    } else if (sort === 'oldest') {
        const response = await getAllPostsByOldest(filter as 'all' | 'news' | 'discuss' | 'events' | 'commercial');
        posts = response.data ?? [];
    } else if (sort === 'hot') {
        const response = await getAllPostsByHot(filter as 'all' | 'news' | 'discuss' | 'events' | 'commercial');
        posts = response.data ?? [];
    }




    return (
        <>
            {posts.length === 0 ? <NoPostsFound /> :
                <div id="page-container" className="flex justify-center w-full">
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 w-full'>
                        {posts.map((post) => (
                            <Card key={post.id} post={post} />
                        ))}
                    </div>
                </div>
            }


        </>
    )

}