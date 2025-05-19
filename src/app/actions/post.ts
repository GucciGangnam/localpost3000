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
            INSERT INTO posts (user_id, content_text, longitude, latitude, hotness)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const values = [clerkID, postContent, longitude, latitude, 1];
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


// Find name of owner of post 
const getOwnerName = async (userId: string) => {
    let client;
    try {
        client = await pool.connect();
        const query = `
            SELECT first_name, last_name FROM users
            WHERE id = $1;
        `;
        const values = [userId];
        const result = await client.query(query, values);
        client.release();
        if (result.rows.length > 0) {
            const { first_name, last_name } = result.rows[0];
            return `${first_name} ${last_name}`;
        } else {
            throw new Error('User not found');
        }
    } catch (error: any) {
        console.error('Database error getting owner name:', error);
        if (client) {
            client.release();
        }
        return "No Name"
    }
}



// THIS GETS ALL POSTS BY NEWEST
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
        // MOdify each post to match the Post interface
        const posts = result.rows.map((post: any) => ({
            id: post.id,
            owner: getOwnerName(post.user_id),
            timeStamp: post.created_at.getTime(),
            content: post.content_text,
            attachment: post.attachment_url,
            category: post.category,
            hotness: post.hotness,
        }));
        client.release();
        return { success: true, data: posts };
    } catch (error: any) {
        console.error('Database error getting posts:', error);
        if (client) {
            client.release();
        }
        return { success: false, error: error.message || 'Failed to get posts from database' }; // Return failure and error
    }
}