'use server'

// IMPORTS 
import pool from "@/lib/db"
import { clerkClient } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { auth } from "@clerk/nextjs/server"

// TYPES
interface Update { 
    id:string,
    created_at: Date,
    content_text: string
}

// CREATE 

// READ 
// GET UPDATES FOR SINGLE POST.
export const getPostUpdates = async (postId: string) => {
    let client;

    try {
        client = await pool.connect();
        const query = `
            SELECT id, created_at, content_text FROM post_updates WHERE parent_post = $1;
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

// UPDATE 

// DELETE