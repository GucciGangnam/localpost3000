// IMPORTS 
import { auth, clerkClient } from '@clerk/nextjs/server';
import { createUser } from "../actions/user";
import { redirect } from "next/navigation";



// COMPONENT
export default async function Page() {

    console.log("On Boarding Running now");

    // simulate 2 second delay
    await new Promise((resolve) => setTimeout(resolve, 4000));


    const { userId } = await auth();
    if (!userId) {
        return <div>User is not logged in</div>;
    }
    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    const userID = user.id;
    const firstName = user.firstName;
    const lastName = user.lastName;

    if (!userId || !firstName || !lastName) {
        console.log("This user has a clerk account but no first name and or last name");
        // Potentially handle this case differently, maybe redirect or show a message
        return <div>User data incomplete at sign up - please make a new account.</div>;
    } else {
        const response = await createUser(firstName, lastName, userID);
        if (response.success) {
            console.log("User creation successful:", response.data);
            return redirect("/feed");
        } else {
            console.error("User creation failed:", response.error);
            // Optionally display an error message to the user
            if (response.error.includes("duplicate key")) {
                // programatically navihate to /feed and return null
                console.log("User already exists, navigating to feed...");
                return redirect("/feed");
            }
            return <div>There has been a connection issue, please reload teh page</div>;
        }
    }
}