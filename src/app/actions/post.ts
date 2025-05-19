'use server'

// IMPORTS 
import pool from "@/lib/db"


// CREATE POST 
export const createPost = async (clerkID: string, postContent: string, coordinates: {
    latitude: number;
    longitude: number
}) => {
    let client;
    const longitude = coordinates.longitude;
    const latitude = coordinates.latitude;
    try {
        client = await pool.connect();
        const query = `
            INSERT INTO posts (user_id, content_text, longitude, latitude)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const values = [clerkID, postContent, longitude, latitude];
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


// GET POSTS (within 1 km) //IMPORTANT!!!!!!!! this doesnt have location search in yet. it somply gets all posts
export const getAllPosts = async () => {
    let client;
    try {
        client = await pool.connect();
        const query = `
            SELECT * FROM posts
            ORDER BY created_at DESC
            LIMIT 20;
        `;
        const result = await client.query(query);
        client.release();
        return { success: true, data: result.rows }; // Return success and data
    } catch (error: any) {
        console.error('Database error getting posts:', error);
        if (client) {
            client.release();
        }
        return { success: false, error: error.message || 'Failed to get posts from database' }; // Return failure and error
    }
}