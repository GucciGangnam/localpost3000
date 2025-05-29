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



// CREATE POST
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

    } catch (error: any) {
        console.error('Database error getting personal posts or Clerk API error:', error);
        if (client) {
            client.release();
        }
        return { success: false, error: error.message || 'Failed to get personal posts' };
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

    } catch (error: any) {
        console.error('Database error getting detailed personal posts or Clerk API error:', error);
        if (client) {
            client.release();
        }
        return { success: false, error: error.message || 'Failed to get detailed personal posts' };
    }

}








// TOGGLE PIN AND UNPIN A POST
export const togglePinPost = async (postId: string) => {
    let client;

    // make sure user is authorized 
    const { userId } = await auth();
    if (!userId) {
        return { success: false, error: "Unauthorized: No authenticated user." };
    }

    console.log('server says....');
    console.log('postId:', postId);
    console.log('userId:', userId);

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
            // This means the user ID was not found in the database.
            client.release();
            return { success: false, error: 'User not found.' };
        }

        const currentPinnedPosts: string[] = checkResult.rows[0].pinned_posts || []; // Ensure it's an array

        let action: 'pinned' | 'unpinned';
        let updateQuery: string;
        let successMessage: string;

        if (currentPinnedPosts.includes(postId)) {
            // Post is already pinned, so unpin it
            updateQuery = `
                UPDATE users
                SET pinned_posts = array_remove(pinned_posts, $1::uuid)
                WHERE id = $2
                RETURNING pinned_posts;
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
            action = 'pinned';
            successMessage = 'Post pinned to your pin board!';
        }

        const values = [postId, userId];
        const updateResult = await client.query(updateQuery, values);
        client.release();

        // Check if the update actually affected a row (it should if user exists)
        if (updateResult.rowCount === 0) {
            // This case should ideally not happen if checkResult.rowCount > 0
            // unless there's a concurrency issue or user data changed immediately.
            console.error('Toggle operation affected 0 rows unexpectedly.');
            return { success: false, error: 'Failed to update pinned posts (no rows affected).' };
        }

        revalidatePath('/'); // Revalidate paths that display pinned posts
        console.log(`Post ${postId} ${action} for user ${userId}. New pinned posts:`, updateResult.rows[0].pinned_posts);

        return { success: true, data: updateResult.rows[0], message: successMessage };

    } catch (error: any) {
        console.error('Database error toggling post pin:', error);
        if (client) {
            client.release();
        }
        return { success: false, error: error.message || 'Failed to toggle post pin.' };
    }
};
// Check if user has pinned post and return boolean
export const checkPostedPinned = async (postID: string): Promise<boolean> => {
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
    } catch (error: any) {
        console.error('Database error checking pinned post:', error);
        // Ensure client is released even if an error occurs during the query
        if (client) {
            client.release();
        }
        return false; // Return false in case of an error
    }
};

// TOGGLE LIKE AND UNLIKE POST
export const toggleLikePost = async (postId: string) => {
    let client; // Declare client here for scope in catch block

    // Make sure user is authorized
    const { userId } = await auth();
    if (!userId) {
        return { success: false, error: "Unauthorized: No authenticated user." };
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

        const userLikedPosts: string[] = userLikesResult.rows[0].liked_posts || []; // Default to empty array if somehow null (shouldn't be with DEFAULT '{}')

        let userUpdateQuery: string;
        let postUpdateQuery: string;
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
            action = 'unliked';
            successMessage = 'Post unliked successfully!';
        } else {
            // Post is not liked by the user, so like it
            userUpdateQuery = `
                UPDATE users
                SET liked_posts = array_append(liked_posts, $1::uuid)
                WHERE id = $2
                RETURNING liked_posts;
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
            // This case is unlikely if userLikesResult.rowCount was > 0, but good for robustness
            await client.query('ROLLBACK');
            client.release();
            return { success: false, error: 'Failed to update user\'s liked posts.' };
        }

        // 3. Execute post's like_count update
        const postUpdateResult = await client.query(postUpdateQuery, [postId]);
        if (postUpdateResult.rowCount === 0) {
            // This means the post ID was not found in the posts table
            await client.query('ROLLBACK'); // Rollback if post not found
            client.release();
            return { success: false, error: 'Post not found to update like count.' };
        }

        await client.query('COMMIT'); // Commit the transaction
        client.release(); // Release the client connection

        // Revalidate paths that display the post or user's liked status
        revalidatePath('/'); // For example, if posts are listed on the home page
        // You might also want to revalidate a specific post's page: revalidatePath(`/posts/${postId}`);

        console.log(`Post ${postId} ${action} by user ${userId}. New like count: ${postUpdateResult.rows[0].like_count}`);
        return { 
            success: true, 
            message: successMessage,
            data: {
                userLikedPosts: userUpdateResult.rows[0].liked_posts,
                likeCount: postUpdateResult.rows[0].like_count,
                action: action // Useful for frontend to know what happened
            }
        };

    } catch (error: any) {
        console.error('Database error toggling like status:', error);
        if (client) {
            await client.query('ROLLBACK'); // Rollback on any error
            client.release();
        }
        return { success: false, error: error.message || 'Failed to toggle like status.' };
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
    } catch (error: any) {
        console.error('Database error checking liked post:', error);
        // Ensure client is released even if an error occurs during the query
        if (client) {
            client.release();
        }
        // In case of any database error, assume the post is not liked
        return false; 
    }
};

