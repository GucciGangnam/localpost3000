
// IMPORTS 
import Card from "@/components/feed/card";
import NoPostsFound from "@/components/feed/no-posts-found";
// ACTIONS
import { getAllPostsByNewset } from "@/app/actions/post";
import { redirect } from 'next/navigation';




// FAKE DB DELE ME 
// const posts = [
//     {
//         id: 1,
//         owner: "User Name",
//         timeStamp: 1745244703345,
//         content: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis",
//         attachment: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/Cat_November_2010-1a.jpg',
//         category: 'news',
//         hotness: 6,
//     },
//     {
//         id: 2,
//         owner: "User Name",
//         timeStamp: 1745223393345,
//         content: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inv",
//         attachment: null,
//         category: 'discuss',
//         hotness: 10,
//     },
//     {
//         id: 3,
//         owner: "User Name",
//         timeStamp: 1745223403876,
//         content: "But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of",
//         attachment: null,
//         category: 'event',
//         hotness: 7,
//     },
//     {
//         id: 4,
//         owner: "User Name",
//         timeStamp: 1745223353543,
//         content: "Li Europan lingues es membres del sam familie. Lor separat existentie es un myth. Por scientie, musica, sport etc, litot Europa usa li sam vocab",
//         attachment: 'https://www.whiskas.co.uk/cdn-cgi/image/format=auto,q=90/sites/g/files/fnmzdf5651/files/2024-06/why-do-cats.jpg',
//         category: 'commercial',
//         hotness: 3,
//     },
//     {
//         id: 5,
//         owner: "User Name",
//         timeStamp: 1745223343234,
//         content: "The European languages are members of the same family. Their separate existence is a myth. For science, music, sport, etc, Europe uses the same.",
//         attachment: null,
//         category: 'news',
//         hotness: 9,
//     },
//     {
//         id: 6,
//         owner: "User Name",
//         timeStamp: 1745223333123,
//         content: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis",
//         attachment: 'https://www.comfortzone.com/-/media/Project/OneWeb/ComfortZone/Images/Blog/how-can-I-soothe-and-calm-my-cat.jpeg',
//         category: 'commercial',
//         hotness: 0,
//     },
//     {
//         id: 7,
//         owner: "User Name",
//         timeStamp: 1745223223321,
//         content: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis",
//         attachment: null,
//         category: 'news',
//         hotness: 2,
//     },
//     {
//         id: 8,
//         owner: "User Name",
//         timeStamp: 1745223303213,
//         content: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis",
//         attachment: null,
//         category: 'news',
//         hotness: 5,
//     },
//     {
//         id: 9,
//         owner: "User Name",
//         timeStamp: 1745223203331,
//         content: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis",
//         attachment: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/Cat_November_2010-1a.jpg',
//         category: 'discuss',
//         hotness: 5,
//     }
// ]
interface Post {
    id: string;
    owner: Promise<string>;
    timeStamp: number;
    content: string;
    attachment: string | null;
    category: 'news' | 'discuss' | 'event' | 'commercial';
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

    const response = await getAllPostsByNewset(filter as 'all' | 'news' | 'discuss' | 'events' | 'commercial');
    const posts: Post[] = response.data ?? [];




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