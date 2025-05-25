'use server'

// IMPORTS 
import pool from "@/lib/db"
import { clerkClient } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

// TYPES 
interface DbPost {
    id: string;
    content_text: string;
    attachment_url: string | null;
    created_at: Date;
    user_id: string;
    category: string;
    longitude: number;
    latitude: number;
    hotness: number;
}

interface PostForClient {
    id: string;
    owner: string; // This will now be the user's full name
    ownerAvatar: string; // New field for the avatar URL
    timeStamp: number;
    content: string;
    attachment: string | null;
    category: string;
    hotness: number;
}



// CREATE POST 
export const createPost = async (clerkID: string, postContent: string, newPostTag: "none" | "discuss" | "news" | "event" | "commercial", coordinates: {
    latitude: number;
    longitude: number;
} | null) => {
    if (!coordinates) {
        return { success: false, error: 'Coordinates are required' }; // Return failure if coordinates are not provided
    }

    console.log("back reached and coords are not null.  heres what server got from client")
    console.log(clerkID, postContent, coordinates)


    let client;
    const longitude = coordinates.longitude;
    const latitude = coordinates.latitude;
    try {
        client = await pool.connect();
        const query = `
            INSERT INTO posts (user_id, content_text, category, longitude, latitude, hotness)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        const values = [clerkID, postContent, newPostTag, longitude, latitude, 1];
        const result = await client.query(query, values);
        client.release();
        revalidatePath('/'); 
        return { success: true, data: result.rows[0] }; // Return success and data
    } catch (error: any) {
        console.error('Database error creating post:', error);
        if (client) {
            client.release();
        }
        return { success: false, error: error.message || 'Failed to create post in database' }; // Return failure and error
    }
};

// EDIT POST _ NOT IMPLEMENTED YET

// DELETE POST _ NOT IMPLEMENTED YET



// GETTING POSTS

// THIS GETS ALL POSTS BY NEWEST
export const getAllPostsByNewest = async (filter: "all" | 'news' | 'discuss' | 'events' | 'commercial') => {
    let client;
    try {
        client = await pool.connect();
        // ADD FILTER QUERY LOGIC !!!!!!!!!!

        // If filter is 'all', we want to get all posts regardless of category
        let query: string;
        if (filter === 'all') {
            query = `
                SELECT * FROM posts
                ORDER BY created_at DESC
                LIMIT 20;
            `;
        } else {
            // If filter is not 'all', we filter by the specified category
            query = `
                SELECT * FROM posts WHERE category = $1
                ORDER BY created_at DESC
                LIMIT 20;
            `;
        }
        // Execute the query with the appropriate filter
        const values = filter === 'all' ? [] : [filter];
        const result = await client.query(query, values);
        const dbPosts: DbPost[] = result.rows; // Type the raw results from your DB


        // --- NEW LOGIC TO FETCH AVATARS & NAMES FROM CLERK ---
        // 1. Collect all unique Clerk user IDs from the fetched posts
        const uniqueClerkUserIds = [...new Set(dbPosts.map(post => post.user_id))];
        // 2. Fetch user details (including avatar) from Clerk for all unique IDs
        // We'll store them in a Map for quick lookup
        const usersDataMap = new Map<string, { imageUrl: string; fullName: string | null; username: string | null }>();
        // Use Promise.all to fetch all user details concurrently for efficiency
        await Promise.all(
            uniqueClerkUserIds.map(async (clerkUserId) => {
                try {
                    const clerk = await clerkClient();
                    const user = await clerk.users.getUser(clerkUserId);
                    usersDataMap.set(clerkUserId, {
                        imageUrl: user.imageUrl,
                        fullName: user.fullName, // Clerk provides fullName
                        username: user.username,  // Clerk provides username
                    });
                } catch (error) {
                    console.error(`Error fetching Clerk user ${clerkUserId}:`, error);
                    // Fallback in case a user is not found or there's an API error
                    usersDataMap.set(clerkUserId, {
                        imageUrl: '/default-avatar.png', // Path to a default avatar image in your public folder
                        fullName: null,
                        username: null,
                    });
                }
            })
        );

        // 3. Modify each post to include owner's name and avatar URL
        const posts: PostForClient[] = dbPosts.map((post: DbPost) => {
            const userData = usersDataMap.get(post.user_id);

            // Determine the display name (fullName preferred, then username, then generic)
            const ownerDisplayName = userData?.fullName || userData?.username || 'Unknown User';

            return {
                id: post.id,
                owner: ownerDisplayName, // Use the name from Clerk
                ownerAvatar: userData?.imageUrl || '/default-avatar.png', // Use the avatar URL from Clerk
                timeStamp: post.created_at.getTime(),
                content: post.content_text,
                attachment: post.attachment_url,
                category: post.category,
                hotness: post.hotness,
            };
        });

        client.release();
        return { success: true, data: posts };

    } catch (error: any) {
        console.error('Database error getting posts or Clerk API error:', error);
        if (client) {
            client.release();
        }
        return { success: false, error: error.message || 'Failed to get posts' };
    }
}

// THIS GETS ALL POSTS BY OLDEST
export const getAllPostsByOldest = async (filter: "all" | 'news' | 'discuss' | 'events' | 'commercial') => {
    let client;
    try {
        client = await pool.connect();
        // ADD FILTER QUERY LOGIC !!!!!!!!!!

        // If filter is 'all', we want to get all posts regardless of category
        let query: string;
        if (filter === 'all') {
            query = `
                SELECT * FROM posts
                ORDER BY created_at ASC
                LIMIT 20;
            `;
        } else {
            // If filter is not 'all', we filter by the specified category
            query = `
                SELECT * FROM posts WHERE category = $1
                ORDER BY created_at ASC
                LIMIT 20;
            `;
        }
        // Execute the query with the appropriate filter
        const values = filter === 'all' ? [] : [filter];
        const result = await client.query(query, values);
        const dbPosts: DbPost[] = result.rows; // Type the raw results from your DB


        // --- NEW LOGIC TO FETCH AVATARS & NAMES FROM CLERK ---
        // 1. Collect all unique Clerk user IDs from the fetched posts
        const uniqueClerkUserIds = [...new Set(dbPosts.map(post => post.user_id))];
        // 2. Fetch user details (including avatar) from Clerk for all unique IDs
        // We'll store them in a Map for quick lookup
        const usersDataMap = new Map<string, { imageUrl: string; fullName: string | null; username: string | null }>();
        // Use Promise.all to fetch all user details concurrently for efficiency
        await Promise.all(
            uniqueClerkUserIds.map(async (clerkUserId) => {
                try {
                    const clerk = await clerkClient();
                    const user = await clerk.users.getUser(clerkUserId);
                    usersDataMap.set(clerkUserId, {
                        imageUrl: user.imageUrl,
                        fullName: user.fullName, // Clerk provides fullName
                        username: user.username,  // Clerk provides username
                    });
                } catch (error) {
                    console.error(`Error fetching Clerk user ${clerkUserId}:`, error);
                    // Fallback in case a user is not found or there's an API error
                    usersDataMap.set(clerkUserId, {
                        imageUrl: '/default-avatar.png', // Path to a default avatar image in your public folder
                        fullName: null,
                        username: null,
                    });
                }
            })
        );

        // 3. Modify each post to include owner's name and avatar URL
        const posts: PostForClient[] = dbPosts.map((post: DbPost) => {
            const userData = usersDataMap.get(post.user_id);

            // Determine the display name (fullName preferred, then username, then generic)
            const ownerDisplayName = userData?.fullName || userData?.username || 'Unknown User';

            return {
                id: post.id,
                owner: ownerDisplayName, // Use the name from Clerk
                ownerAvatar: userData?.imageUrl || '/default-avatar.png', // Use the avatar URL from Clerk
                timeStamp: post.created_at.getTime(),
                content: post.content_text,
                attachment: post.attachment_url,
                category: post.category,
                hotness: post.hotness,
            };
        });

        client.release();
        return { success: true, data: posts };

    } catch (error: any) {
        console.error('Database error getting posts or Clerk API error:', error);
        if (client) {
            client.release();
        }
        return { success: false, error: error.message || 'Failed to get posts' };
    }
}

// THIS GETS ALL POSTS BY HOTNESS
export const getAllPostsByHot = async (filter: "all" | 'news' | 'discuss' | 'events' | 'commercial') => {
    let client;
    try {
        client = await pool.connect();
        // ADD FILTER QUERY LOGIC !!!!!!!!!!

        // If filter is 'all', we want to get all posts regardless of category
        let query: string;
        if (filter === 'all') {
            query = `
                SELECT * FROM posts
                ORDER BY hotness DESC
                LIMIT 20;
            `;
        } else {
            // If filter is not 'all', we filter by the specified category
            query = `
                SELECT * FROM posts WHERE category = $1
                ORDER BY hotness DESC
                LIMIT 20;
            `;
        }
        // Execute the query with the appropriate filter
        const values = filter === 'all' ? [] : [filter];
        const result = await client.query(query, values);
        const dbPosts: DbPost[] = result.rows; // Type the raw results from your DB


        // --- NEW LOGIC TO FETCH AVATARS & NAMES FROM CLERK ---
        // 1. Collect all unique Clerk user IDs from the fetched posts
        const uniqueClerkUserIds = [...new Set(dbPosts.map(post => post.user_id))];
        // 2. Fetch user details (including avatar) from Clerk for all unique IDs
        // We'll store them in a Map for quick lookup
        const usersDataMap = new Map<string, { imageUrl: string; fullName: string | null; username: string | null }>();
        // Use Promise.all to fetch all user details concurrently for efficiency
        await Promise.all(
            uniqueClerkUserIds.map(async (clerkUserId) => {
                try {
                    const clerk = await clerkClient();
                    const user = await clerk.users.getUser(clerkUserId);
                    usersDataMap.set(clerkUserId, {
                        imageUrl: user.imageUrl,
                        fullName: user.fullName, // Clerk provides fullName
                        username: user.username,  // Clerk provides username
                    });
                } catch (error) {
                    console.error(`Error fetching Clerk user ${clerkUserId}:`, error);
                    // Fallback in case a user is not found or there's an API error
                    usersDataMap.set(clerkUserId, {
                        imageUrl: '/default-avatar.png', // Path to a default avatar image in your public folder
                        fullName: null,
                        username: null,
                    });
                }
            })
        );

        // 3. Modify each post to include owner's name and avatar URL
        const posts: PostForClient[] = dbPosts.map((post: DbPost) => {
            const userData = usersDataMap.get(post.user_id);

            // Determine the display name (fullName preferred, then username, then generic)
            const ownerDisplayName = userData?.fullName || userData?.username || 'Unknown User';

            return {
                id: post.id,
                owner: ownerDisplayName, // Use the name from Clerk
                ownerAvatar: userData?.imageUrl || '/default-avatar.png', // Use the avatar URL from Clerk
                timeStamp: post.created_at.getTime(),
                content: post.content_text,
                attachment: post.attachment_url,
                category: post.category,
                hotness: post.hotness,
            };
        });

        client.release();
        return { success: true, data: posts };

    } catch (error: any) {
        console.error('Database error getting posts or Clerk API error:', error);
        if (client) {
            client.release();
        }
        return { success: false, error: error.message || 'Failed to get posts' };
    }
}



