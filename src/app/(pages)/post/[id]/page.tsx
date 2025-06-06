
// IMPORTS 

import PostButtons from "@/components/post/postButtons";
import OwnerPostButtons from "@/components/post/ownerPostButtons";
import { getSinglePost } from "@/app/actions/post";
import PostCard from "@/components/post/postCard";
import { getCommentsForPost } from "@/app/actions/comment";
import PostCommentCard from "@/components/post/postCommentCard";
import PostCommentForm from "@/components/post/postCommentForm";
import { auth } from '@clerk/nextjs/server';
import {MapPinned} from "lucide-react"

interface PageParams {
    id: string;
}

interface PostForClient {
    id: string;
    ownerId?: string
    owner: string;
    ownerAvatar: string;
    timeStamp: number;
    content: string;
    attachment: string | null;
    category: string;
    hotness: number;
}

interface CommentForClient {
    id: string;
    userId: string;
    userName: string; // Full name of the user
    userAvatar: string; // URL of the user's avatar
    commentText: string;
    createdAt: string;
    likeCount: number;
    // postId: string; // I dont think teh clien tneeds this...?
}

export default async function Page({ params }: { params: PageParams }) {
    const { userId } = await auth();
    const { id } = await params; // Get the id from the params object
    // Fetch the post data using the id
    const response = await getSinglePost(id);
    if (!response.success || !response.data) {
        return <div className="p-4">Post not found</div>;
    }
    const post: PostForClient = response.data;
    if (!post) {
        return <div className="p-4">Post not found</div>;
    }
    const isOwner = userId === post.ownerId
    console.log(userId)
    console.log(post.ownerId)

    // Fetch comments for the post
    const commentsResponse = await getCommentsForPost(id);
    if (!commentsResponse.success || !commentsResponse.data) {
        return <div className="p-4">No comments found</div>;
    }
    const comments: CommentForClient[] = commentsResponse.data;




    return (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 p-4 w-full'>
            {/* LEFT */}
            <div className="p-2">
                <p className="font-bold mb-2">Post</p>
                {isOwner && <a href="/myposts"
                className="text-sm text-muted-foreground flex items-center gap-2 hover:underline"
                > 
                <MapPinned size={15}/>
                Go to my posts to see the location of this post
                </a>}
                {isOwner ? <OwnerPostButtons id={id} />: <PostButtons id={id} />}
                <PostCard post={post} />
            </div>


            {/* RIGHT */}
            <div className=" p-2 rounded-md flex flex-col">
                <p className="font-bold mb-2">Comments</p>
                <div className="bg-muted p-4 rounded-md flex flex-col gap-2">
                    <PostCommentForm postId={post.id} />
                    {comments.map((comment) => (
                        <PostCommentCard {...comment} key={comment.id} />
                    ))}
                </div>
            </div>
        </div>
    );
}