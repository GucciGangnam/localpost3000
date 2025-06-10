'use server'

// IMPORTS 
import pool from "@/lib/db"
import { clerkClient } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { auth } from "@clerk/nextjs/server"

//CREATE USER 
export const createUser = async (firstname: string, lastname: string, userId: string) => {
    let client;
    // Lowercase the first and last name and teh uppcase the first letter of each
    firstname = firstname.toLowerCase().charAt(0).toUpperCase() + firstname.slice(1);
    lastname = lastname.toLowerCase().charAt(0).toUpperCase() + lastname.slice(1);
    try {
        client = await pool.connect();
        const query = `
            INSERT INTO users (id, first_name, last_name)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const values = [userId, firstname, lastname];
        const result = await client.query(query, values);
        client.release();
        return { success: true, data: result.rows[0] }; // Return success and data
    } catch (error: any) {
        console.error('Database error creating user:', error);
        if (client) {
            client.release();
        }
        return { success: false, error: error.message || 'Failed to create user in database' }; // Return failure and error
    }
};


// GET USER 
// for getting first/last name, bio, posts
export const getUserInfo = async (userId: string) => {
    let client;
    try {
        client = await pool.connect();
        const query = `
            SELECT first_name, last_name, bio, verified FROM users WHERE id = $1;
        `;
        const values = [userId];
        const result = await client.query(query, values);
        client.release();
        return { success: true, data: result.rows[0] }; // Return success and data
    } catch (error: any) {
        console.error('Database error getting user info:', error);
        if (client) {
            client.release();
        }
        return { success: false, error: error.message || 'Failed to get user info from database' }; // Return failure and error
    }
};



// UPDATE USER 
// UPDATE BIO
export const updateBio = async (bio: string) => {
    // 1. Get the authenticated user ID on the server
    const { userId } = await auth();

    // 2. Validate that a user is logged in
    if (!userId) {
        return { success: false, error: "Unauthorized: No authenticated user." };
    }

    let client;
    try {
        client = await pool.connect(); // Get a client from the pool
        // SQL query to update the bio
        const query = `
            UPDATE users
            SET bio = $1
            WHERE id = $2;
        `;
        // Parameters for the query: [new_bio_value, user_id]
        const values = [bio, userId];
        await client.query(query, values);
        revalidatePath("/");
        return { success: true, message: "Bio updated successfully." };
    } catch (error: any) {
        console.error("Error updating bio:", error);
        return { success: false, error: "Failed to update bio." };
    } finally {
        if (client) {
            client.release(); // Release the client back to the pool
        }
    }
}

