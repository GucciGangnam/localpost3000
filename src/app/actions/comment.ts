'use server'

// COMMENTS ACTIONS 
// IMPORTS 
import pool from "@/lib/db"
import { clerkClient } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { auth } from "@clerk/nextjs/server"

// TYPES 
interface DBComment {
    id: string;
    user_id: string;
    comment_text: string;
    created_at: string;
    like_count: number;
    post_id: string;
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

// CREATE
export const createComment = async (postId: string, commentText: string): Promise<{ success: boolean, error?: string }> => {

    // 1. Get the authenticated user ID on the server
    const { userId } = await auth();

    // 2. Validate that a user is logged in
    if (!userId) {
        return { success: false, error: "Unauthorized: No authenticated user." };
    }

    let client;

    try {
        client = await pool.connect();
        const query = `
            INSERT INTO comments (user_id, comment_text, post_id)
            VALUES ($1, $2, $3)
            RETURNING id, user_id, comment_text, created_at, like_count, post_id;
        `;
        const values = [userId, commentText, postId];
        const result = await client.query<DBComment>(query, values);
        const comment = result.rows[0];
        if (!comment) {
            revalidatePath('/');
            return { success: false, error: "Failed to create comment." };
        } else {
            revalidatePath(`/post/${postId}`);
            return {
                success: true
            }
        }
    } catch (error) {
        console.error('Error creating comment:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        return { success: false, error: errorMessage };
    }
}
// Cgeck if comment i salready liekd 
export const checkCommentLiked = async (commentId: string): Promise<boolean> => {
    // 1. Get the authenticated user ID on the server
    const { userId } = await auth();
    // 2. Validate that a user is logged in
    if (!userId) {
        return false; 
    }
    let client;
    try {
        client = await pool.connect();
        // Check if the comment exists
        const checkQuery = `
            SELECT id, like_count, user_id
            FROM comments
            WHERE id = $1;
        `;
        const checkValues = [commentId];
        const checkResult = await client.query<DBComment>(checkQuery, checkValues);
        const comment = checkResult.rows[0];
        if (!comment) {
            throw new Error("Comment not found.");
        }
        // Check if the user has already liked this comment
        const userQuery = `
            SELECT liked_comments
            FROM users
            WHERE id = $1;
        `;
        const userValues = [userId];
        const userResult = await client.query<{ liked_comments: string[] }>(userQuery, userValues);
        const user = userResult.rows[0];
        if (!user) {
            throw new Error("User not found.");
        }
        // Check if the comment ID is in the user's liked_comments array
        const likedComments = user.liked_comments || [];
        return likedComments.includes(commentId);
    } catch (error) {
        console.error('Error checking if comment is liked:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        throw new Error(errorMessage);
    } finally {
        if (client) {
            client.release();
        }
    }
};
// Toggle like a comment // get the authenticated user ID on the server, use that id to find the 'user'.  then find that users 'liked_comments' array.  if the comment ID is include din that array, remove it and decrement that comments 'like_count' otherise add it and incremwnt 
export const toggleLikeComment = async (commentId: string): Promise<{ success: boolean, error?: string }> => {
    // 1. Get the authenticated user ID on the server
    const { userId } = await auth();
    // 2. Validate that a user is logged in
    if (!userId) {
        return { success: false, error: "You must be logged in to like a comment" };
    }
    let client;
    try {
        client = await pool.connect();
        // Check if the comment exists
        const checkQuery = `
            SELECT id, like_count, user_id
            FROM comments
            WHERE id = $1;
        `;
        const checkValues = [commentId];
        const checkResult = await client.query<DBComment>(checkQuery, checkValues);
        const comment = checkResult.rows[0];
        if (!comment) {
            return { success: false, error: "Comment not found." };
        }
        // Check if the user has already liked this comment
        const userQuery = `
            SELECT liked_comments
            FROM users
            WHERE id = $1;
        `;
        const userValues = [userId];
        const userResult = await client.query<{ liked_comments: string[] }>(userQuery, userValues);
        const user = userResult.rows[0];
        if (!user) {
            return { success: false, error: "User not found." };
        }
        // Toggle like status
        let newLikeCount = comment.like_count;
        let likedComments = user.liked_comments || [];
        if (likedComments.includes(commentId)) {
            // User has already liked this comment, so remove the like
            likedComments = likedComments.filter(id => id !== commentId);
            newLikeCount -= 1;
        } else {
            // User has not liked this comment, so add the like
            likedComments.push(commentId);
            newLikeCount += 1;
        }
        // Update the comment's like count and user's liked comments
        const updateCommentQuery = `
            UPDATE comments
            SET like_count = $1
            WHERE id = $2;
        `;
        const updateCommentValues = [newLikeCount, commentId];
        await client.query(updateCommentQuery, updateCommentValues);
        const updateUserQuery = `
            UPDATE users
            SET liked_comments = $1
            WHERE id = $2;
        `;
        const updateUserValues = [likedComments, userId];
        await client.query(updateUserQuery, updateUserValues);
        // Revalidate the path to ensure the latest data is fetched
        revalidatePath(`/post/${comment.post_id}`);
        return { success: true };
    } catch (error) {
        console.error('Error toggling like on comment:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        return { success: false, error: errorMessage };
    } finally {
        if (client) {
            client.release();
        }
    }
};

// READ 
// get all comments for one post 
export const getCommentsForPost = async (postId: string): Promise<{ success: boolean, data?: CommentForClient[], error?: string }> => {
    let client;
    try {
        client = await pool.connect();
        const query = `
            SELECT c.id, c.user_id, c.comment_text, c.created_at, c.like_count, c.post_id
            FROM comments c
            WHERE c.post_id = $1
            ORDER BY c.created_at DESC;
        `;
        const values = [postId];
        const result = await client.query<DBComment>(query, values);

        const dbComments = result.rows;

        // Collect all unique Clerk user IDs from the fetched comments
        const uniqueClerkUserIds = [...new Set(dbComments.map(comment => comment.user_id))];

        // Fetch user details (including avatar) from Clerk for all unique IDs
        const usersDataMap = new Map<string, { imageUrl: string; fullName: string | null }>();
        await Promise.all(
            uniqueClerkUserIds.map(async (clerkUserId) => {
                try {
                    const clerk = await clerkClient();
                    const user = await clerk.users.getUser(clerkUserId);
                    usersDataMap.set(clerkUserId, {
                        imageUrl: user.imageUrl,
                        fullName: user.fullName, // Clerk provides fullName
                    });
                } catch (error) {
                    console.error(`Error fetching Clerk user ${clerkUserId}:`, error);
                    // Fallback in case a user is not found or there's an API error
                    usersDataMap.set(clerkUserId, {
                        imageUrl: '/default-avatar.png', // Path to a default avatar image in your public folder
                        fullName: null,
                    });
                }
            })
        );

        // Map the comments to include user details from Clerk
        const comments = dbComments.map(comment => {
            const userData = usersDataMap.get(comment.user_id) || { imageUrl: '/default-avatar.png', fullName: 'Unknown User' };
            return {
                id: comment.id,
                userId: comment.user_id,
                userName: userData.fullName || 'Unknown User', // Use fullName from Clerk
                userAvatar: userData.imageUrl, // Use avatar URL from Clerk
                commentText: comment.comment_text,
                createdAt: comment.created_at,
                likeCount: comment.like_count,
            };
        });

        return { success: true, data: comments };
    } catch (error) {
        console.error('Error fetching comments:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        return { success: false, error: errorMessage };
    } finally {
        if (client) {
            client.release();
        }
    }
};

// UPDATE - dont think well be needing this 

// DELETE
export const deleteComment = async (commentId: string): Promise<{ success: boolean, error?: string }> => {
    // 1. Get the authenticated user ID on the server
    const { userId } = await auth();
    // 2. Validate that a user is logged in
    if (!userId) {
        return { success: false, error: "Unauthorized: No authenticated user." };
    }
    let client;
    try {
        client = await pool.connect();
        // Check if the comment exists and belongs to the user
        const checkQuery = `
            SELECT id, user_id
            FROM comments
            WHERE id = $1 AND user_id = $2;
        `;
        const checkValues = [commentId, userId];
        const checkResult = await client.query<DBComment>(checkQuery, checkValues);
        const comment = checkResult.rows[0];
        if (!comment) {
            return { success: false, error: "Comment not found or does not belong to the user." };
        }
        // Delete the comment
        const deleteQuery = `
            DELETE FROM comments
            WHERE id = $1;
        `;
        await client.query(deleteQuery, [commentId]);
        revalidatePath(`/post/${comment.post_id}`);
        return { success: true };
    } catch (error) {
        console.error('Error deleting comment:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        return { success: false, error: errorMessage };
    } finally {
        if (client) {
            client.release();
        }
    }
}
