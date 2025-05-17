'use server'

// IMPORTS 
import pool from "@/lib/db"


// CREATE POST 
export const createPost = async (userId: string, postContent: string) => {
    let client;
    try {
        client = await pool.connect();
        const query = `
            INSERT INTO posts (user_id, content)
            VALUES ($1, $2)
            RETURNING *;
        `;
        const values = [userId, postContent];
        const result = await client.query(query, values);
        client.release();
        return { success: true, data: result.rows[0] }; // Return success and data
    } catch (error: any) {
        console.error('Database error creating post:', error);
        if (client) {
            client.release();
        }
        return { success: false, error: error.message || 'Failed to create post in database' }; // Return failure and error
    }
};