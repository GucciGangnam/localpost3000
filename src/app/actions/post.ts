'use server'

// IMPORTS 
import pool from "@/lib/db"
import { clerkClient } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { auth } from "@clerk/nextjs/server"

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
    distance: number;

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

interface PersonalPostForClient {
    id: string;
    owner: string; // This will now be the user's full name
    ownerAvatar: string; // New field for the avatar URL
    created_at: Date;
    content: string;
    attachment: string | null;
    category: string;
    hotness: number;
    longitude: number;
    latitude: number;
}



// // // // // // // // // // // CREATE POST // // // // // // // // // // //
export const createPost = async (postContent: string, newPostTag: "none" | "discuss" | "news" | "event" | "commercial", coordinates: {
    latitude: number;
    longitude: number;
} | null) => {
    if (!coordinates) {
        return { success: false, error: 'Coordinates are required' }; // Return failure if coordinates are not provided
    }

    // 1. Get the authenticated user ID on the server
    const { userId } = await auth();

    // 2. Validate that a user is logged in
    if (!userId) {
        return { success: false, error: "Unauthorized: No authenticated user." };
    }

    let client;
    const longitude = coordinates.longitude;
    const latitude = coordinates.latitude;
    try {
        client = await pool.connect();

        // Check if the user has available posts
        const checkQuery = `
            SELECT available_posts FROM users WHERE id = $1;
        `;
        const checkValues = [userId];
        const checkResult = await client.query(checkQuery, checkValues);
        const availablePosts = checkResult.rows[0]?.available_posts || 0;

        if (availablePosts <= 0) {
            client.release();
            return { success: false, error: "You don't have any available posts left." };
        }

        const query = `
            INSERT INTO posts (user_id, content_text, category, longitude, latitude, hotness)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        const values = [userId, postContent, newPostTag, longitude, latitude, 1];
        const result = await client.query(query, values);

        // Increment the total_posts column for the user
        const incrementQuery = `
            UPDATE users
            SET total_posts = total_posts + 1, available_posts = available_posts - 1
            WHERE id = $1;
        `;
        const incrementValues = [userId];
        await client.query(incrementQuery, incrementValues);

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
export const deletePost = async (postId: string) => {

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
            DELETE FROM posts WHERE id = $1 AND user_id = $2 RETURNING *;
        `;
        const values = [postId, userId];
        const result = await client.query(query, values);
        client.release();

        if (result.rowCount === 0) {
            return { success: false, error: 'Post not found or you do not have permission to delete this post.' };
        }

        revalidatePath('/');
        return { success: true, data: result.rows[0] }; // Return success and data
    } catch (error: any) {
        console.error('Database error deleting post:', error);
        if (client) {
            client.release();
        }
        return { success: false, error: error.message || 'Failed to delete post' }; // Return failure and error
    }
}



// // // // // // // // // // // GETTING POSTS // // // // // // // // // // //

// THIS GETS ALL POSTS BY NEWEST
export const getAllPostsByNewest = async (filter: "all" | 'news' | 'discuss' | 'event' | 'commercial', longitude: number, latitude: number) => {

    let client;

    // Validate coordinates
    if (!longitude || !latitude || isNaN(longitude) || isNaN(latitude)) {
        return { success: false, error: 'Invalid coordinates provided' };
    }

    try {
        client = await pool.connect();
        // ADD FILTER QUERY LOGIC !!!!!!!!!!

        // If filter is 'all', we want to get all posts regardless of category
        let query: string;
        if (filter === 'all') {
            query = `
                SELECT *, 
                    (6371 * acos(
                        cos(radians($1)) * cos(radians(latitude)) * 
                        cos(radians(longitude) - radians($2)) + 
                        sin(radians($1)) * sin(radians(latitude))
                    )) AS distance
                FROM posts
                WHERE (6371 * acos(
                    cos(radians($1)) * cos(radians(latitude)) * 
                    cos(radians(longitude) - radians($2)) + 
                    sin(radians($1)) * sin(radians(latitude))
                )) <= $3
                ORDER BY created_at DESC
                LIMIT 20;
            `;
        } else {
            query = `
                SELECT *, 
                    (6371 * acos(
                        cos(radians($2)) * cos(radians(latitude)) * 
                        cos(radians(longitude) - radians($3)) + 
                        sin(radians($2)) * sin(radians(latitude))
                    )) AS distance
                FROM posts 
                WHERE category = $1 
                    AND (6371 * acos(
                        cos(radians($2)) * cos(radians(latitude)) * 
                        cos(radians(longitude) - radians($3)) + 
                        sin(radians($2)) * sin(radians(latitude))
                    )) <= $4
                ORDER BY created_at DESC
                LIMIT 20;
            `;
        }
        // Execute the query with the appropriate filter
        const radiusKm = 1; // 1km radius - you can make this configurable
        const values = filter === 'all'
            ? [latitude, longitude, radiusKm]
            : [filter, latitude, longitude, radiusKm];
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
export const getAllPostsByOldest = async (filter: "all" | 'news' | 'discuss' | 'event' | 'commercial', longitude: number, latitude: number) => {
    let client;

    // Validate coordinates
    if (!longitude || !latitude || isNaN(longitude) || isNaN(latitude)) {
        return { success: false, error: 'Invalid coordinates provided' };
    }

    try {
        client = await pool.connect();
        // ADD FILTER QUERY LOGIC !!!!!!!!!!

        // If filter is 'all', we want to get all posts regardless of category
        let query: string;
        if (filter === 'all') {
            query = `
                SELECT *, 
                    (6371 * acos(
                        cos(radians($1)) * cos(radians(latitude)) * 
                        cos(radians(longitude) - radians($2)) + 
                        sin(radians($1)) * sin(radians(latitude))
                    )) AS distance
                FROM posts
                WHERE (6371 * acos(
                    cos(radians($1)) * cos(radians(latitude)) * 
                    cos(radians(longitude) - radians($2)) + 
                    sin(radians($1)) * sin(radians(latitude))
                )) <= $3
                ORDER BY created_at ASC
                LIMIT 20;
            `;
        } else {
            query = `
                SELECT *, 
                    (6371 * acos(
                        cos(radians($2)) * cos(radians(latitude)) * 
                        cos(radians(longitude) - radians($3)) + 
                        sin(radians($2)) * sin(radians(latitude))
                    )) AS distance
                FROM posts 
                WHERE category = $1 
                    AND (6371 * acos(
                        cos(radians($2)) * cos(radians(latitude)) * 
                        cos(radians(longitude) - radians($3)) + 
                        sin(radians($2)) * sin(radians(latitude))
                    )) <= $4
                ORDER BY created_at ASC
                LIMIT 20;
            `;
        }
        // Execute the query with the appropriate filter
        const radiusKm = 1; // 1km radius - you can make this configurable
        const values = filter === 'all'
            ? [latitude, longitude, radiusKm]
            : [filter, latitude, longitude, radiusKm];
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
export const getAllPostsByHot = async (filter: "all" | 'news' | 'discuss' | 'event' | 'commercial', longitude: number, latitude: number) => {
    let client;

    // Validate coordinates
    if (!longitude || !latitude || isNaN(longitude) || isNaN(latitude)) {
        return { success: false, error: 'Invalid coordinates provided' };
    }

    try {
        client = await pool.connect();
        // ADD FILTER QUERY LOGIC !!!!!!!!!!

        // If filter is 'all', we want to get all posts regardless of category
        let query: string;
        if (filter === 'all') {
            query = `
                SELECT *, 
                    (6371 * acos(
                        cos(radians($1)) * cos(radians(latitude)) * 
                        cos(radians(longitude) - radians($2)) + 
                        sin(radians($1)) * sin(radians(latitude))
                    )) AS distance
                FROM posts
                WHERE (6371 * acos(
                    cos(radians($1)) * cos(radians(latitude)) * 
                    cos(radians(longitude) - radians($2)) + 
                    sin(radians($1)) * sin(radians(latitude))
                )) <= $3
                ORDER BY hotness DESC
                LIMIT 20;
            `;
        } else {
            query = `
                SELECT *, 
                    (6371 * acos(
                        cos(radians($2)) * cos(radians(latitude)) * 
                        cos(radians(longitude) - radians($3)) + 
                        sin(radians($2)) * sin(radians(latitude))
                    )) AS distance
                FROM posts 
                WHERE category = $1 
                    AND (6371 * acos(
                        cos(radians($2)) * cos(radians(latitude)) * 
                        cos(radians(longitude) - radians($3)) + 
                        sin(radians($2)) * sin(radians(latitude))
                    )) <= $4
                ORDER BY hotness DESC
                LIMIT 20;
            `;
        }
        // Execute the query with the appropriate filter
        const radiusKm = 1; // 1km radius - you can make this configurable
        const values = filter === 'all'
            ? [latitude, longitude, radiusKm]
            : [filter, latitude, longitude, radiusKm];
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

// GET PERSONAL POSTS (for profile page)
export const getPersonalPosts = async () => {

    let client;
    try {
        // 1. Get the authenticated user ID on the server
        const { userId } = await auth();

        // 2. Validate that a user is logged in
        if (!userId) {
            return { success: false, error: "Unauthorized: No authenticated user." };
        }
        client = await pool.connect();
        const query = `
            SELECT * FROM posts WHERE user_id = $1 ORDER BY created_at DESC;
        `;
        const values = [userId];
        const result = await client.query(query, values);
        const dbPosts: DbPost[] = result.rows; // Type the raw results from your DB

        // --- NEW LOGIC TO FETCH AVATARS & NAMES FROM CLERK ---
        // 1. Fetch user details (including avatar) from Clerk
        const clerk = await clerkClient();
        const user = await clerk.users.getUser(userId);

        // 2. Modify each post to include owner's name and avatar URL
        const posts: PersonalPostForClient[] = dbPosts.map((post: DbPost) => ({
            id: post.id,
            owner: user.fullName || user.username || 'Unknown User', // Use the name from Clerk
            ownerAvatar: user.imageUrl || '/default-avatar.png', // Use the avatar URL from Clerk
            created_at: post.created_at,
            longitude: post.longitude,
            latitude: post.latitude,
            content: post.content_text,
            attachment: post.attachment_url,
            category: post.category,
            hotness: post.hotness,
        }));

        const postsMadeQuery = `
            SELECT total_posts FROM users WHERE id = $1;
        `;
        const postsMadeValues = [userId];
        const postsMadeResult = await client.query(postsMadeQuery, postsMadeValues);
        const postsMade = postsMadeResult.rows[0]?.total_posts || 0; // Extract the number or default to 0


        const postsAvailableQuery = `
            SELECT available_posts FROM users WHERE id = $1;
        `;
        const postsAvailableValues = [userId];
        const postsAvailableResult = await client.query(postsAvailableQuery, postsAvailableValues);
        const postsAvailable = postsAvailableResult.rows[0]?.available_posts || 0; // Extract the number or default to 0

        client.release();
        return { success: true, data: posts, postCount: { postsMade, postsAvailable } };

    } catch (error: any) {
        console.error('Database error getting personal posts or Clerk API error:', error);
        if (client) {
            client.release();
        }
        return { success: false, error: error.message || 'Failed to get personal posts' };
    }
}



// GET DETAILED PERSONAL POSTS (for profile page)
export const getDetailedPersonalPosts = async () => {

    let client;
    try {
        // 1. Get the authenticated user ID on the server
        const { userId } = await auth();

        // 2. Validate that a user is logged in
        if (!userId) {
            return { success: false, error: "Unauthorized: No authenticated user." };
        }
        client = await pool.connect();
        const query = `
            SELECT * FROM posts WHERE user_id = $1 ORDER BY created_at DESC;
        `;
        const values = [userId];
        const result = await client.query(query, values);
        const dbPosts: DbPost[] = result.rows; // Type the raw results from your DB

        // --- NEW LOGIC TO FETCH AVATARS & NAMES FROM CLERK ---
        // 1. Fetch user details (including avatar) from Clerk
        const clerk = await clerkClient();
        const user = await clerk.users.getUser(userId);

        // 2. Modify each post to include owner's name and avatar URL
        const posts: PersonalPostForClient[] = dbPosts.map((post: DbPost) => ({
            id: post.id,
            owner: user.fullName || user.username || 'Unknown User', // Use the name from Clerk
            ownerAvatar: user.imageUrl || '/default-avatar.png', // Use the avatar URL from Clerk
            created_at: post.created_at,
            content: post.content_text,
            attachment: post.attachment_url,
            category: post.category,
            hotness: post.hotness,
            longitude: post.longitude,
            latitude: post.latitude,
        }));

        client.release();
        return { success: true, data: posts };

    } catch (error: any) {
        console.error('Database error getting detailed personal posts or Clerk API error:', error);
        if (client) {
            client.release();
        }
        return { success: false, error: error.message || 'Failed to get detailed personal posts' };
    }

}
