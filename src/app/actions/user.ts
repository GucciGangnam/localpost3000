'use server'

// IMPORTS 
import pool from "@/lib/db"

//CREATE USER 
export const createUser = async (firstname: string, lastname: string, userId: string) => {
    let client;
    // Lowercase the first and last name and teh uppcase the first letter of each
    firstname = firstname.toLowerCase().charAt(0).toUpperCase() + firstname.slice(1);
    lastname = lastname.toLowerCase().charAt(0).toUpperCase() + lastname.slice(1);
    try {
        client = await pool.connect();
        const query = `
            INSERT INTO users (clerk_id, first_name, last_name)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const values = [userId, firstname, lastname]; // Assuming clerk_id now holds userId
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

// UPDATE USER 
// UPDATE BIO 
export const updateUserBio = async (userId: string, bio: string) => {
    let client;
    try {
        client = await pool.connect();
        const query = `
            UPDATE users
            SET bio = $1
            WHERE clerk_id = $2
            RETURNING *;
        `;
        const values = [bio, userId];
        const result = await client.query(query, values);
        client.release();
        return { success: true, data: result.rows[0] }; // Return success and data
    } catch (error: any) {
        console.error('Database error updating user bio:', error);
        if (client) {
            client.release();
        }
        return { success: false, error: error.message || 'Failed to update user bio in database' }; // Return failure and error
    }
};


// GET USER 
// for getting first/last name, bio, posts
export const getUserInfo = async (userId: string) => {
    let client;
    try {
        client = await pool.connect();
        const query = `
            SELECT first_name, last_name, bio FROM users WHERE clerk_id = $1;
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

