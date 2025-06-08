'use server'

// IMPORTS 
import pool from "@/lib/db"
import { clerkClient } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { auth } from "@clerk/nextjs/server"

// TYPES
interface Update {
    id: string,
    created_at: Date,
    content_text: string,
    owner_id: string
}

// CREATE 
export const CreateUpdate = async (parentPostId: string, updateContext: string) => {
    const { userId } = await auth();

    if (!userId) {
        return { success: false, error: "Unauthorized: No authenticated user." };
    }

    let client;

    try {
        client = await pool.connect();

        // 1. Fetch the owner_id of the parent post
        const getPostOwnerQuery = `
            SELECT user_id
            FROM posts
            WHERE id = $1;
        `;
        const postOwnerResult = await client.query(getPostOwnerQuery, [parentPostId]);

        if (postOwnerResult.rows.length === 0) {
            return { success: false, error: "Parent post not found." };
        }

        const postOwnerId = postOwnerResult.rows[0].user_id;

        // 2. Compare the authenticated user's ID with the post's owner_id
        if (userId !== postOwnerId) {
            return { success: false, error: "Unauthorized: You are not the owner of this post." };
        }

        // 3. If the user is the owner, proceed to create the post_update
        const createUpdateQuery = `
             INSERT INTO post_updates (parent_post, content_text, owner_id)
             VALUES ($1, $2, $3);
         `;
        const createUpdateValues = [parentPostId, updateContext, userId];

        await client.query(createUpdateQuery, createUpdateValues);

        revalidatePath(`/post/${parentPostId}`);
        revalidatePath('/');

        return { success: true, message: "Post update created successfully." };

    } catch (error) {
        console.error('Error creating post update:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        return { success: false, error: errorMessage };
    } finally {
        if (client) {
            client.release();
        }
    }
};

// READ 
// GET UPDATES FOR SINGLE POST.
export const getPostUpdates = async (postId: string) => {
    let client;

    try {
        client = await pool.connect();
        const query = `
            SELECT id, created_at, content_text, owner_id FROM post_updates WHERE parent_post = $1;
        `;
        const values = [postId];
        const result = await client.query(query, values);

        // --- CORRECTED LINE HERE ---
        // result.rows already contains an array of all matching rows
        const updatesArray: Update[] = result.rows; // Assign the entire array of rows

        client.release();
        console.log(updatesArray); // This should now log an array of all updates

        // It's good practice to check if any rows were found even after the fix
        if (updatesArray.length === 0) {
            return { success: false, error: 'No updates found for this post.' };
        }

        return { success: true, data: updatesArray }; // Return success and the array of updates
    } catch (error: any) {
        console.error('Database error getting post updates:', error); // More specific error message
        if (client) {
            client.release();
        }
        return { success: false, error: error.message || 'Failed to get post updates' }; // Return failure and error
    }
}

// DELETE
export const deleteUpdate = async (updateId: string) => {
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
         SELECT id, owner_id
         FROM post_updates
         WHERE id = $1 AND owner_id = $2;
     `;
        const checkValues = [updateId, userId];
        const checkResult = await client.query(checkQuery, checkValues);
        const update = checkResult.rows[0];
        if (!update) {
            return { success: false, error: "Update not found or does not belong to the user." };
        }
        // Delete the comment
        const deleteQuery = `
         DELETE FROM post_updates
         WHERE id = $1;
     `;
        await client.query(deleteQuery, [updateId]);
        revalidatePath(`/`);
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