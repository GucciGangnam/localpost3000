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

// UPDATE

// DELETE