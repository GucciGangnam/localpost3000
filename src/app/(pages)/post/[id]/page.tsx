
// IMPORTS 

import PostButtons from "@/components/post/postButtons";
import { getSinglePost } from "@/app/actions/post";
import PostCard from "@/components/post/postCard";
import { getCommentsForPost } from "@/app/actions/comment";
import PostCommentCard from "@/components/post/postCommentCard";

interface PageParams {
    id: string;
}

interface PostForClient {
    id: string;
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

    // Fetch comments for the post
    const commentsResponse = await getCommentsForPost(id);
    if (!commentsResponse.success || !commentsResponse.data) {
        return <div className="p-4">No comments found</div>;
    }
    const comments: CommentForClient[] = commentsResponse.data;




    return (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 p-4 w-full'>
            <div className="p-2">
                <p className="font-bold mb-2">Post</p>
                <PostButtons id={id} /> {/* Or whatever prop name PostButtons expects */}
                <PostCard post={post} />
            </div>

            <div className=" p-2 rounded-md flex flex-col">
                <p className="font-bold mb-2">Comments</p>
                <div className="bg-muted p-4 rounded-md flex flex-col gap-2">

                    {comments.map((comment) => (
                        <PostCommentCard {...comment} key={comment.id} />
                    ))}
                </div>
            </div>
        </div>
    );
}