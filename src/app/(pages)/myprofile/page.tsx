
import { CreditCard, KeyRound, GlobeLock } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { auth, clerkClient } from '@clerk/nextjs/server';
import { getUserInfo } from "../../actions/user";





export default async function Page() {

    const { userId } = await auth();
    if (!userId) {
        return <div>User is not logged in</div>;
    }
    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    const userID = user.id;
    const userData = await getUserInfo(userID);
    if (!userData.success) {
        console.log("User data not found");
        return <div>User data not found</div>;
    }
    const { first_name, last_name, bio } = userData.data;




    return (
        <div className="p-4 flex justify-center items-center flex-col sm:flex-row sm:items-start gap-8 mt-4 ">

            <div id="Left" className=" w-full flex flex-col gap-8 max-w-130">

                <div id="NameAndPhoto" className="rounded-md flex">
                    <div id="Left" className=" flex items-center gap-4">
                        <UserButton
                            showName={true}
                            appearance={{
                                elements: {
                                    userButtonAvatarBox: {
                                        width: '75px',
                                        height: '75px',
                                    },
                                    userButtonBox: {
                                        flexDirection: "row-reverse",
                                    },
                                    userName: {
                                        fontSize: '1.2em',
                                        fontWeight: 'bold', 
                                        color: 'red',

                                    },
                                },
                            }}
                        />

                    </div>

                    <div id="right" className="grow flex justify-center items-center">
                        <button className="bg-muted text-sm text-muted-foreground hover:bg-input px-4 py-0.5 rounded-sm">Edit Bio</button>
                    </div>
                </div>

                <div id="Bio" className=" rounded-md flex gap-2 flex-col">
                    <div>{bio}</div>
                </div>

                <div id="buttos-container" className="flex flex-col gap-2">


                    <button className="bg-muted hover:bg-input text-muted-foreground rounded-md p-2 flex justify-center items-center gap-2"><GlobeLock size={20} color="var(--muted-foreground)" />Privacy</button>
                    <button className="bg-muted hover:bg-input text-muted-foreground rounded-md p-2 flex justify-center items-center gap-2"><KeyRound size={20} color="var(--muted-foreground)" />Security</button>
                    <button className="bg-muted hover:bg-input text-muted-foreground rounded-md p-2 flex justify-center items-center gap-2"><CreditCard size={20} color="var(--muted-foreground)" />Billing</button>

                </div>

            </div>


            <div id="Right" className=" h-full w-full flex flex-col gap-2 max-w-130">
                <div id="Title" className="font-bold">My Posts</div>
                <div id="Post-Container" className="flex flex-col gap-2">
                    <div className="bg-muted rounded-md min-h-40 flex justify-center items-center"> You havn't made any posts yet </div>
                </div>
            </div>


        </div>
    )
}