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
    hotness: string;
    distance: number;

}
interface PostForClient {
    id: string;
    ownerId: string;
    owner: string; // This will now be the user's full name
    ownerAvatar: string; // New field for the avatar URL
    timeStamp: number;
    content: string;
    attachment: string | null;
    category: string;
    hotness: string;
}
interface PersonalPostForClient {
    id: string;
    owner: string; // This will now be the user's full name
    ownerAvatar: string; // New field for the avatar URL
    created_at: Date;
    content: string;
    attachment: string | null;
    category: string;
    hotness: string;
    longitude: number;
    latitude: number;
}



// CREATE POST
export const createPost = async (
    postContent: string,
    newPostTag: "none" | "discuss" | "news" | "event" | "commercial",
    coordinates: {
        latitude: number;
        longitude: number;
    } | null,
    imageUrl?: string | null // This will now receive the URL from Cloudinary
) => {
    if (!coordinates) {
        return { success: false, error: 'Coordinates are required' }; // Return failure if coordinates are not provided
    }

    // 1. Get the authenticated user ID on the server
    const { userId } = await auth();

    // 2. Validate that a user is logged in
    if (!userId) {
        return { success: false, error: "Unauthorized: No authenticated user." };
    }

    const utcTimeNow = new Date().getTime();
    const utcAsString = utcTimeNow.toString();


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


        let query: string;
        let values: (string | number | null)[];

        if (imageUrl) {
            query = `
            INSERT INTO posts (user_id, content_text, category, longitude, latitude, hotness, attachment_url)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
            `;
            values = [userId, postContent, newPostTag, longitude, latitude, utcAsString, imageUrl];
        } else {
            query = `
            INSERT INTO posts (user_id, content_text, category, longitude, latitude, hotness)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
            `;
            values = [userId, postContent, newPostTag, longitude, latitude, utcAsString];
        }
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
    } catch (error: unknown) {
        console.error('Database error creating post:', error);
        if (client) {
            client.release();
        }
        // Type narrowing for error
        if (error instanceof Error) {
            return { success: false, error: error.message || 'Failed to create post in database' };
        }
        // Fallback for non-Error objects
        return { success: false, error: 'An unknown error occurred while creating the post.' };
    }
};

// DELETE POST
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
        // delete all commenst wjere teh post_id is the postId
        const deleteCommentsQuery = `
            DELETE FROM comments WHERE post_id = $1;
        `;
        await client.query(deleteCommentsQuery, [postId]);
        // Release the client after the query
        client.release();

        if (result.rowCount === 0) {
            return { success: false, error: 'Post not found or you do not have permission to delete this post.' };
        }
        // Decrement the total_posts column for the user
        const decrementQuery = `
            UPDATE users
            SET total_posts = total_posts - 1, available_posts = available_posts + 1
            WHERE id = $1;
        `;
        const decrementValues = [userId];
        await client.query(decrementQuery, decrementValues);
        // Revalidate the path to update the cache
        revalidatePath('/');
        return { success: true, data: result.rows[0] }; // Return success and data
    } catch (error: unknown) { // Change 'any' to 'unknown'
        console.error('Database error deleting post:', error);
        if (client) {
            client.release();
        }
        // Type narrowing to safely access error properties
        if (error instanceof Error) {
            return { success: false, error: error.message || 'Failed to delete post' };
        }
        // Fallback for cases where the error is not an instance of Error
        return { success: false, error: 'An unknown error occurred while deleting the post.' };
    }
}

// // // // // // // // // // // GETTING POSTS // // // // // // // // // // //
// THIS GETS ALL POSTS BY NEWEST
export const getAllPostsByNewest = async (
    filter: "all" | 'news' | 'discuss' | 'event' | 'commercial',
    longitude: number,
    latitude: number,
    offset: number,
) => {

    let client;

    // Validate coordinates
    if (!longitude || !latitude || isNaN(longitude) || isNaN(latitude)) {
        return { success: false, error: 'Invalid coordinates provided' };
    }

    try {
        client = await pool.connect();

        // If filter is 'all', we want to get all posts regardless of category
        let query: string;
        if (filter === 'all') {
            query = `
                SELECT *, 
                    (6371 * acos(
                        cos(radians($1)) * cos(radians(latitude)) * cos(radians(longitude) - radians($2)) + 
                        sin(radians($1)) * sin(radians(latitude))
                    )) AS distance
                FROM posts
                WHERE (6371 * acos(
                    cos(radians($1)) * cos(radians(latitude)) * cos(radians(longitude) - radians($2)) + 
                    sin(radians($1)) * sin(radians(latitude))
                )) <= $3
                ORDER BY created_at DESC
                LIMIT 20 OFFSET $4;
            `;
        } else {
            query = `
                SELECT *, 
                    (6371 * acos(
                        cos(radians($2)) * cos(radians(latitude)) * cos(radians(longitude) - radians($3)) + 
                        sin(radians($2)) * sin(radians(latitude))
                    )) AS distance
                FROM posts 
                WHERE category = $1 
                    AND (6371 * acos(
                        cos(radians($2)) * cos(radians(latitude)) * cos(radians(longitude) - radians($3)) + 
                        sin(radians($2)) * sin(radians(latitude))
                    )) <= $4
                ORDER BY created_at DESC
                LIMIT 20 OFFSET $5;
            `;
        }
        // Execute the query with the appropriate filter
        const radiusKm = 1; // 1km radius - you can make this configurable
        const values = filter === 'all'
            ? [latitude, longitude, radiusKm, offset]
            : [filter, latitude, longitude, radiusKm, offset];
        const result = await client.query(query, values);
        const dbPosts: DbPost[] = result.rows;

        // --- NEW LOGIC TO FETCH AVATARS & NAMES FROM CLERK ---
        const uniqueClerkUserIds = [...new Set(dbPosts.map(post => post.user_id))];
        const usersDataMap = new Map<string, { imageUrl: string; fullName: string | null; username: string | null }>();
        await Promise.all(
            uniqueClerkUserIds.map(async (clerkUserId) => {
                try {
                    const clerk = await clerkClient();
                    const user = await clerk.users.getUser(clerkUserId);
                    usersDataMap.set(clerkUserId, {
                        imageUrl: user.imageUrl,
                        fullName: user.fullName,
                        username: user.username,
                    });
                } catch (error) {
                    console.error(`Error fetching Clerk user ${clerkUserId}:`, error);
                    usersDataMap.set(clerkUserId, {
                        imageUrl: '/default-avatar.png',
                        fullName: null,
                        username: null,
                    });
                }
            })
        );

        const posts: PostForClient[] = dbPosts.map((post: DbPost) => {
            const userData = usersDataMap.get(post.user_id);
            const ownerDisplayName = userData?.fullName || userData?.username || 'Unknown User';
            return {
                id: post.id,
                ownerId: post.user_id,
                owner: ownerDisplayName,
                ownerAvatar: userData?.imageUrl || '/default-avatar.png',
                timeStamp: post.created_at.getTime(),
                content: post.content_text,
                attachment: post.attachment_url,
                category: post.category,
                hotness: post.hotness,
            };
        });

        client.release();
        return { success: true, data: posts };

    } catch (error: unknown) { // Changed 'any' to 'unknown'
        console.error('Database error getting posts or Clerk API error:', error);
        if (client) {
            client.release();
        }
        // Type narrowing to safely access error properties
        if (error instanceof Error) {
            return { success: false, error: error.message || 'Failed to get posts' };
        }
        // Fallback for cases where the error is not an instance of Error
        return { success: false, error: 'An unknown error occurred while getting posts.' };
    }
}
// THIS GETS ALL POSTS BY OLDEST
export const getAllPostsByOldest = async (
    filter: "all" | 'news' | 'discuss' | 'event' | 'commercial',
    longitude: number,
    latitude: number,
    offset: number,
) => {
    let client;

    // Validate coordinates
    if (!longitude || !latitude || isNaN(longitude) || isNaN(latitude)) {
        return { success: false, error: 'Invalid coordinates provided' };
    }

    try {
        client = await pool.connect();

        // If filter is 'all', we want to get all posts regardless of category
        let query: string;
        if (filter === 'all') {
            query = `
                SELECT *, 
                    (6371 * acos(
                        cos(radians($1)) * cos(radians(latitude)) * cos(radians(longitude) - radians($2)) + 
                        sin(radians($1)) * sin(radians(latitude))
                    )) AS distance
                FROM posts
                WHERE (6371 * acos(
                    cos(radians($1)) * cos(radians(latitude)) * cos(radians(longitude) - radians($2)) + 
                    sin(radians($1)) * sin(radians(latitude))
                )) <= $3
                ORDER BY created_at ASC
                LIMIT 20 OFFSET $4;
            `;
        } else {
            query = `
                SELECT *, 
                    (6371 * acos(
                        cos(radians($2)) * cos(radians(latitude)) * cos(radians(longitude) - radians($3)) + 
                        sin(radians($2)) * sin(radians(latitude))
                    )) AS distance
                FROM posts 
                WHERE category = $1 
                    AND (6371 * acos(
                        cos(radians($2)) * cos(radians(latitude)) * cos(radians(longitude) - radians($3)) + 
                        sin(radians($2)) * sin(radians(latitude))
                    )) <= $4
                ORDER BY created_at ASC
                LIMIT 20 OFFSET $5;
            `;
        }
        // Execute the query with the appropriate filter
        const radiusKm = 1; // 1km radius - you can make this configurable
        const values = filter === 'all'
            ? [latitude, longitude, radiusKm, offset]
            : [filter, latitude, longitude, radiusKm, offset];
        const result = await client.query(query, values);
        const dbPosts: DbPost[] = result.rows;

        // --- NEW LOGIC TO FETCH AVATARS & NAMES FROM CLERK ---
        const uniqueClerkUserIds = [...new Set(dbPosts.map(post => post.user_id))];
        const usersDataMap = new Map<string, { imageUrl: string; fullName: string | null; username: string | null }>();
        await Promise.all(
            uniqueClerkUserIds.map(async (clerkUserId) => {
                try {
                    const clerk = await clerkClient();
                    const user = await clerk.users.getUser(clerkUserId);
                    usersDataMap.set(clerkUserId, {
                        imageUrl: user.imageUrl,
                        fullName: user.fullName,
                        username: user.username,
                    });
                } catch (error) {
                    console.error(`Error fetching Clerk user ${clerkUserId}:`, error);
                    usersDataMap.set(clerkUserId, {
                        imageUrl: '/default-avatar.png',
                        fullName: null,
                        username: null,
                    });
                }
            })
        );

        const posts: PostForClient[] = dbPosts.map((post: DbPost) => {
            const userData = usersDataMap.get(post.user_id);
            const ownerDisplayName = userData?.fullName || userData?.username || 'Unknown User';
            return {
                id: post.id,
                ownerId: post.user_id,
                owner: ownerDisplayName,
                ownerAvatar: userData?.imageUrl || '/default-avatar.png',
                timeStamp: post.created_at.getTime(),
                content: post.content_text,
                attachment: post.attachment_url,
                category: post.category,
                hotness: post.hotness,
            };
        });

        client.release();
        return { success: true, data: posts };

    } catch (error: unknown) { // Changed 'any' to 'unknown'
        console.error('Database error getting posts or Clerk API error:', error);
        if (client) {
            client.release();
        }
        // Type narrowing to safely access error properties
        if (error instanceof Error) {
            return { success: false, error: error.message || 'Failed to get posts' };
        }
        // Fallback for cases where the error is not an instance of Error
        return { success: false, error: 'An unknown error occurred while getting posts.' };
    }
}
// THIS GETS ALL POSTS BY HOTNESS
export const getAllPostsByHot = async (
    filter: "all" | 'news' | 'discuss' | 'event' | 'commercial',
    longitude: number,
    latitude: number,
    offset: number
) => {
    let client;
    // Validate coordinates
    if (!longitude || !latitude || isNaN(longitude) || isNaN(latitude)) {
        return { success: false, error: 'Invalid coordinates provided' };
    }

    try {
        client = await pool.connect();

        // If filter is 'all', we want to get all posts regardless of category
        let query: string;
        if (filter === 'all') {
            query = `
                SELECT *, 
                    (6371 * acos(
                        cos(radians($1)) * cos(radians(latitude)) * cos(radians(longitude) - radians($2)) + 
                        sin(radians($1)) * sin(radians(latitude))
                    )) AS distance
                FROM posts
                WHERE (6371 * acos(
                    cos(radians($1)) * cos(radians(latitude)) * cos(radians(longitude) - radians($2)) + 
                    sin(radians($1)) * sin(radians(latitude))
                )) <= $3
                ORDER BY hotness DESC
                LIMIT 20 OFFSET $4;
            `;
        } else {
            query = `
                SELECT *, 
                    (6371 * acos(
                        cos(radians($2)) * cos(radians(latitude)) * cos(radians(longitude) - radians($3)) + 
                        sin(radians($2)) * sin(radians(latitude))
                    )) AS distance
                FROM posts 
                WHERE category = $1 
                    AND (6371 * acos(
                        cos(radians($2)) * cos(radians(latitude)) * cos(radians(longitude) - radians($3)) + 
                        sin(radians($2)) * sin(radians(latitude))
                    )) <= $4
                ORDER BY hotness DESC
                LIMIT 20 OFFSET $5;
            `;
        }
        // Execute the query with the appropriate filter
        const radiusKm = 1; // 1km radius - you can make this configurable
        const values = filter === 'all'
            ? [latitude, longitude, radiusKm, offset]
            : [filter, latitude, longitude, radiusKm, offset];
        const result = await client.query(query, values);
        const dbPosts: DbPost[] = result.rows;

        // --- NEW LOGIC TO FETCH AVATARS & NAMES FROM CLERK ---
        const uniqueClerkUserIds = [...new Set(dbPosts.map(post => post.user_id))];
        const usersDataMap = new Map<string, { imageUrl: string; fullName: string | null; username: string | null }>();
        await Promise.all(
            uniqueClerkUserIds.map(async (clerkUserId) => {
                try {
                    const clerk = await clerkClient();
                    const user = await clerk.users.getUser(clerkUserId);
                    usersDataMap.set(clerkUserId, {
                        imageUrl: user.imageUrl,
                        fullName: user.fullName,
                        username: user.username,
                    });
                } catch (error) {
                    console.error(`Error fetching Clerk user ${clerkUserId}:`, error);
                    usersDataMap.set(clerkUserId, {
                        imageUrl: '/default-avatar.png',
                        fullName: null,
                        username: null,
                    });
                }
            })
        );

        const posts: PostForClient[] = dbPosts.map((post: DbPost) => {
            const userData = usersDataMap.get(post.user_id);
            const ownerDisplayName = userData?.fullName || userData?.username || 'Unknown User';
            return {
                id: post.id,
                ownerId: post.user_id,
                owner: ownerDisplayName,
                ownerAvatar: userData?.imageUrl || '/default-avatar.png',
                timeStamp: post.created_at.getTime(),
                content: post.content_text,
                attachment: post.attachment_url,
                category: post.category,
                hotness: post.hotness,
            };
        });

        client.release();
        return { success: true, data: posts };

    } catch (error: unknown) { // Changed 'any' to 'unknown'
        console.error('Database error getting posts or Clerk API error:', error);
        if (client) {
            client.release();
        }
        // Type narrowing to safely access error properties
        if (error instanceof Error) {
            return { success: false, error: error.message || 'Failed to get posts' };
        }
        // Fallback for cases where the error is not an instance of Error
        return { success: false, error: 'An unknown error occurred while getting posts.' };
    }
}
// GET PERSONAL POSTS (for other users profile page) -- - - -- DONT THINK THIS IS IN USE
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

    } catch (error: unknown) { // Changed 'any' to 'unknown'
        console.error('Database error getting personal posts or Clerk API error:', error);
        if (client) {
            client.release();
        }
        // Type narrowing to safely access error properties
        if (error instanceof Error) {
            return { success: false, error: error.message || 'Failed to get personal posts' };
        }
        // Fallback for cases where the error is not an instance of Error
        return { success: false, error: 'An unknown error occurred while getting personal posts.' };
    }
}

// GET DETAILED PERSONAL POSTS (for OWN profile page)
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

    } catch (error: unknown) { // Changed 'any' to 'unknown'
        console.error('Database error getting detailed personal posts or Clerk API error:', error);
        if (client) {
            client.release();
        }
        // Type narrowing to safely access error properties
        if (error instanceof Error) {
            return { success: false, error: error.message || 'Failed to get detailed personal posts' };
        }
        // Fallback for cases where the error is not an instance of Error
        return { success: false, error: 'An unknown error occurred while getting detailed personal posts.' };
    }
}

// GET A USERS PINNED POSTS
export const getPinnedPosts = async () => {
    let client;
    // 1. Get the authenticated user ID on the server
    const { userId } = await auth();
    // 2. Validate that a user is logged in
    if (!userId) {
        return { success: false, error: "Unauthorized: No authenticated user." };
    }
    try {
        client = await pool.connect();
        const query = `
            SELECT pinned_posts FROM users WHERE id = $1;
        `;
        const values = [userId];
        const result = await client.query(query, values);

        if (result.rowCount === 0) {
            return { success: false, error: 'User not found or no pinned posts.' };
        }

        const pinnedPosts: string[] = result.rows[0].pinned_posts || []; // Ensure it's an array
        if (pinnedPosts.length === 0) {
            return { success: true, data: [] }; // No pinned posts
        }

        // Fetch the actual post details for each pinned post
        const postsQuery = `
            SELECT * FROM posts WHERE id = ANY($1::uuid[]);
        `;
        const postsResult = await client.query(postsQuery, [pinnedPosts]);

        // --- NEW LOGIC TO FETCH AVATARS & NAMES FROM CLERK ---
        // 1. Collect all unique Clerk user IDs from the fetched posts
        const uniqueClerkUserIds = [...new Set(postsResult.rows.map(post => post.user_id))];
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
        const posts: PostForClient[] = postsResult.rows.map((post: DbPost) => {
            const userData = usersDataMap.get(post.user_id);

            // Determine the display name (fullName preferred, then username, then generic)
            const ownerDisplayName = userData?.fullName || userData?.username || 'Unknown User';

            return {
                id: post.id,
                ownerId: post.user_id, // Include the user ID for potential future use
                owner: ownerDisplayName, // Use the name from Clerk
                ownerAvatar: userData?.imageUrl || '/default-avatar.png', // Use the avatar URL from Clerk
                timeStamp: post.created_at.getTime(),
                content: post.content_text,
                attachment: post.attachment_url,
                category: post.category,
                hotness: post.hotness,
            };
        }
        );
        client.release();
        return { success: true, data: posts }; // Return success and posts data
    } catch (error: unknown) { // Changed 'any' to 'unknown'
        console.error('Database error getting pinned posts or Clerk API error:', error);
        if (client) {
            client.release();
        }
        // Type narrowing to safely access error properties
        if (error instanceof Error) {
            return { success: false, error: error.message || 'Failed to get pinned posts' };
        }
        // Fallback for non-Error objects
        return { success: false, error: 'An unknown error occurred while getting pinned posts.' };
    }
}

// GET A SINGLE POST AND ITS DATA   // // // // // // // // // // // // // // //
export const getSinglePost = async (postId: string) => {
    let client;

    try {
        client = await pool.connect();
        const query = `
            SELECT * FROM posts WHERE id = $1;
        `;
        const values = [postId];
        const result = await client.query(query, values);
        if (result.rowCount === 0) {
            client.release();
            return { success: false, error: 'Post not found.' };
        }
        const dbPost: DbPost = result.rows[0]; // Type the raw result from your DB
        // --- NEW LOGIC TO FETCH AVATARS & NAMES FROM CLERK ---
        // 1. Fetch user details (including avatar) from Clerk
        const clerk = await clerkClient();
        const user = await clerk.users.getUser(dbPost.user_id);
        // 2. Modify the post to include owner's name and avatar URL
        const post: PostForClient = {
            id: dbPost.id,
            ownerId: dbPost.user_id,
            owner: user.fullName || user.username || 'Unknown User', // Use the name from Clerk
            ownerAvatar: user.imageUrl || '/default-avatar.png', // Use the avatar URL from Clerk
            timeStamp: dbPost.created_at.getTime(),
            content: dbPost.content_text,
            attachment: dbPost.attachment_url,
            category: dbPost.category,
            hotness: dbPost.hotness,
        };
        client.release();
        return { success: true, data: post }; // Return success and post data
    } catch (error: unknown) { // Changed 'any' to 'unknown'
        console.error('Database error getting single post or Clerk API error:', error);
        if (client) {
            client.release();
        }
        // Type narrowing to safely access error properties
        if (error instanceof Error) {
            return { success: false, error: error.message || 'Failed to get single post' };
        }
        // Fallback for non-Error objects
        return { success: false, error: 'An unknown error occurred while getting the single post.' };
    }
};




// TOGGLE PIN AND UNPIN A POST
export const togglePinPost = async (postId: string) => {
    let client;

    // make sure user is authorized 
    const { userId } = await auth();
    if (!userId) {
        return { success: false, error: "You must be logged in to pin a post" };
    }

    try {
        client = await pool.connect();

        // 1. Check if the post is currently pinned for the user
        const checkQuery = `
            SELECT pinned_posts
            FROM users
            WHERE id = $1;
        `;
        const checkResult = await client.query(checkQuery, [userId]);

        if (checkResult.rowCount === 0) {
            client.release();
            return { success: false, error: 'User not found.' };
        }

        const currentPinnedPosts: string[] = checkResult.rows[0].pinned_posts || [];

        let action: 'pinned' | 'unpinned';
        let updateQuery: string;
        let hotnessQuery: string;
        let successMessage: string;

        if (currentPinnedPosts.includes(postId)) {
            // Post is already pinned, so unpin it
            updateQuery = `
                UPDATE users
                SET pinned_posts = array_remove(pinned_posts, $1::uuid)
                WHERE id = $2
                RETURNING pinned_posts;
            `;
            hotnessQuery = `
                UPDATE posts
                SET hotness = (CAST(hotness AS BIGINT) - 3600000)::text
                WHERE id = $1
                RETURNING hotness;
            `;
            action = 'unpinned';
            successMessage = 'Post unpinned from your pin board!';
        } else {
            // Post is not pinned, so pin it
            updateQuery = `
                UPDATE users
                SET pinned_posts = array_append(pinned_posts, $1::uuid)
                WHERE id = $2
                RETURNING pinned_posts;
            `;
            hotnessQuery = `
                UPDATE posts
                SET hotness = (CAST(hotness AS BIGINT) + 3600000)::text
                WHERE id = $1
                RETURNING hotness;
            `;
            action = 'pinned';
            successMessage = 'Post pinned to your pin board!';
        }

        // Update user's pinned_posts
        const values = [postId, userId];
        const updateResult = await client.query(updateQuery, values);

        // Update post's hotness
        const hotnessResult = await client.query(hotnessQuery, [postId]);

        client.release();

        if (updateResult.rowCount === 0) {
            console.error('Toggle operation affected 0 rows unexpectedly.');
            return { success: false, error: 'Failed to update pinned posts (no rows affected).' };
        }

        revalidatePath('/');
        return {
            success: true,
            data: {
                pinnedPosts: updateResult.rows[0].pinned_posts,
                hotness: hotnessResult.rows[0]?.hotness
            },
            message: successMessage,
            action: action
        };

    } catch (error: unknown) { // Changed 'any' to 'unknown'
        console.error('Database error toggling post pin:', error);
        if (client) {
            client.release();
        }
        // Type narrowing to safely access error properties
        if (error instanceof Error) {
            return { success: false, error: error.message || 'Failed to toggle post pin.' };
        }
        // Fallback for non-Error objects
        return { success: false, error: 'An unknown error occurred while toggling the post pin.' };
    }
};
// Check if user has pinned post and return boolean
export const checkPostPinned = async (postID: string): Promise<boolean> => {
    let client; // Declare client here so it's accessible in catch block

    // Make sure user is authorized
    const { userId } = await auth();
    if (!userId) {
        return false; // User is not authenticated, cannot check pinned status
    }

    try {
        client = await pool.connect();
        const query = `
            SELECT pinned_posts
            FROM users
            WHERE id = $1;
        `;
        const values = [userId];

        // AWAIT the query result!
        const result = await client.query(query, values);

        // Release the client connection as soon as you're done with it
        client.release();

        if (result.rowCount === 0) {
            return false; // User not found or no pinned posts
        }

        // Ensure pinned_posts is treated as an array, even if null from DB (though you set DEFAULT '{}')
        const pinnedPosts: string[] = result.rows[0].pinned_posts || [];

        // Return true if postID is in the pinned posts array
        return pinnedPosts.includes(postID);
    } catch (error: unknown) { // Changed 'any' to 'unknown'
        console.error('Database error checking pinned post:', error);
        // Ensure client is released even if an error occurs during the query
        if (client) {
            client.release();
        }
        // No need for error.message here, as the function returns a boolean
        return false; // Return false in case of an error
    }
};

// TOGGLE LIKE AND UNLIKE POST
export const toggleLikePost = async (postId: string) => {
    let client; // Declare client here for scope in catch block

    // Make sure user is authorized
    const { userId } = await auth();
    if (!userId) {
        return { success: false, error: "You must be logged in to like a post" };
    }

    try {
        client = await pool.connect();
        await client.query('BEGIN'); // Start a transaction

        // 1. Check if the post is currently liked by the user
        const checkUserLikesQuery = `
            SELECT liked_posts
            FROM users
            WHERE id = $1;
        `;
        const userLikesResult = await client.query(checkUserLikesQuery, [userId]);

        if (userLikesResult.rowCount === 0) {
            await client.query('ROLLBACK'); // User not found, rollback transaction
            client.release();
            return { success: false, error: 'User not found.' };
        }

        const userLikedPosts: string[] = userLikesResult.rows[0].liked_posts || [];

        let userUpdateQuery: string;
        let postUpdateQuery: string;
        let hotnessUpdateQuery: string;
        let action: 'liked' | 'unliked';
        let successMessage: string;

        if (userLikedPosts.includes(postId)) {
            // Post is already liked by the user, so unlike it
            userUpdateQuery = `
                UPDATE users
                SET liked_posts = array_remove(liked_posts, $1::uuid)
                WHERE id = $2
                RETURNING liked_posts;
            `;
            postUpdateQuery = `
                UPDATE posts
                SET like_count = GREATEST(0, like_count - 1)
                WHERE id = $1
                RETURNING like_count;
            `;
            hotnessUpdateQuery = `
                UPDATE posts
                SET hotness = (CAST(hotness AS BIGINT) - 1800000)::text
                WHERE id = $1
                RETURNING hotness;
            `;
            action = 'unliked';
            successMessage = 'Post unliked successfully!';
        } else {
            // Post is not liked by the user, so like it
            userUpdateQuery = `
                UPDATE users
                SET liked_posts = array_append(pinned_posts, $1::uuid)
                WHERE id = $2
                RETURNING liked_posts;
            `;
            hotnessUpdateQuery = `
                UPDATE posts
                SET hotness = (CAST(hotness AS BIGINT) + 1800000)::text
                WHERE id = $1
                RETURNING hotness;
            `;
            postUpdateQuery = `
                UPDATE posts
                SET like_count = like_count + 1
                WHERE id = $1
                RETURNING like_count;
            `;
            action = 'liked';
            successMessage = 'Post liked successfully!';
        }

        // 2. Execute user's liked_posts update
        const userUpdateResult = await client.query(userUpdateQuery, [postId, userId]);
        if (userUpdateResult.rowCount === 0) {
            await client.query('ROLLBACK');
            client.release();
            return { success: false, error: 'Failed to update user\'s liked posts.' };
        }

        // 3. Execute post's like_count update
        const postUpdateResult = await client.query(postUpdateQuery, [postId]);
        if (postUpdateResult.rowCount === 0) {
            await client.query('ROLLBACK');
            client.release();
            return { success: false, error: 'Post not found to update like count.' };
        }

        // 4. Update post's hotness
        const hotnessUpdateResult = await client.query(hotnessUpdateQuery, [postId]);
        if (hotnessUpdateResult.rowCount === 0) {
            await client.query('ROLLBACK');
            client.release();
            return { success: false, error: 'Failed to update post hotness.' };
        }

        await client.query('COMMIT');
        client.release();

        revalidatePath('/');

        return {
            success: true,
            message: successMessage,
            data: {
                userLikedPosts: userUpdateResult.rows[0].liked_posts,
                likeCount: postUpdateResult.rows[0].like_count,
                hotness: hotnessUpdateResult.rows[0].hotness,
                action: action
            }
        };

    } catch (error: unknown) { // Changed 'any' to 'unknown'
        console.error('Database error toggling like status:', error);
        if (client) {
            await client.query('ROLLBACK');
            client.release();
        }
        // Type narrowing to safely access error properties
        if (error instanceof Error) {
            return { success: false, error: error.message || 'Failed to toggle like status.' };
        }
        // Fallback for non-Error objects
        return { success: false, error: 'An unknown error occurred while toggling like status.' };
    }
};
// CHECK IF USER LIKED TEH POST
export const checkPostLiked = async (postId: string): Promise<boolean> => {
    let client; // Declare client here so it's accessible in catch block

    // Make sure user is authorized
    const { userId } = await auth();
    if (!userId) {
        // User is not authenticated, so they can't have liked the post
        return false;
    }

    try {
        client = await pool.connect();
        const query = `
            SELECT liked_posts
            FROM users
            WHERE id = $1;
        `;
        const values = [userId];

        // AWAIT the query result!
        const result = await client.query(query, values);

        // Release the client connection as soon as you're done with it
        client.release();

        if (result.rowCount === 0) {
            // User not found in the database, so they haven't liked it
            return false;
        }

        // Get the liked_posts array. It should be non-null due to DEFAULT '{}'
        // but || [] is good for defensive programming.
        const likedPosts: string[] = result.rows[0].liked_posts || [];

        // Return true if postId is in the likedPosts array, false otherwise
        return likedPosts.includes(postId);
    } catch (error: unknown) { // Changed 'any' to 'unknown'
        console.error('Database error checking liked post:', error);
        // Ensure client is released even if an error occurs during the query
        if (client) {
            client.release();
        }
        // In case of any database error, assume the post is not liked
        // Type narrowing for console.error, not for the return value
        if (error instanceof Error) {
            // Log the specific error message if it's an Error object
            console.error('Specific error message:', error.message);
        }
        return false;
    }
};

