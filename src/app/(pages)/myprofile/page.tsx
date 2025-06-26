
import { CreditCard, KeyRound, GlobeLock, Radio, CircleCheck, Signpost, Cake, BadgeCheck } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { auth, clerkClient } from '@clerk/nextjs/server';
import { getUserInfo } from "../../actions/user";
import { getPersonalPosts } from "../../actions/post";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import BioEditor from "./bioEditor";




// TYPES 

export default async function Page() {

    const { userId } = await auth();
    if (!userId) {
        return <div>User is not logged in</div>;
    }
    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    const userID = user.id;
    const userData = await getUserInfo(userID);
    console.log("User Data:", userData);
    if (!userData.success) {
        console.log("User data not found");
        return <div>User data not found</div>;
    }
    const myPosts = await getPersonalPosts();
    const { bio } = userData.data;
    const userAvatar = user.imageUrl;




    return (
        <div className="p-4 flex items-center flex-col sm:flex-row sm:items-start gap-8 mt-4 max-h-screen ">

            <div id="Left" className=" w-full flex flex-col gap-8 max-w-130">

                <div id="NameAndPhoto" className="rounded-md flex">
                    <div id="Left" className="flex items-center gap-4 border-2 border-muted rounded-md p-2">
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
                        <BioEditor bio={bio} />
                    </div>
                </div>

                <div id="Bio" className=" rounded-md flex gap-2 flex-col">
                    <p className="whitespace-pre-wrap">{bio}</p>
                </div>

                <div id="buttos-container" className="flex flex-col gap-2">

                    <button className="bg-muted hover:bg-input text-muted-foreground rounded-md p-2 flex justify-center items-center gap-2"><GlobeLock size={20} color="var(--muted-foreground)" />Privacy</button>
                    <button className="bg-muted hover:bg-input text-muted-foreground rounded-md p-2 flex justify-center items-center gap-2"><KeyRound size={20} color="var(--muted-foreground)" />Security</button>
                    <button className="bg-muted hover:bg-input text-muted-foreground rounded-md p-2 flex justify-center items-center gap-2"><CreditCard size={20} color="var(--muted-foreground)" />Billing</button>

                </div>

            </div>


            <div id="Right" className="  max-h-full w-full flex flex-col gap-2 max-w-130">

                <div className=" rounded-md min-h-40 flex flex-col gap-4 justify-center items-center">
                    <div id="Info" className="bg-muted rounded-md p-2 flex flex-col items-center gap-4 w-full">
                        <div id="top" className="font-bold w-full flex gap-4 items-center">
                            <Avatar className="w-8 h-8">
                                <AvatarImage src={userAvatar} />
                                <AvatarFallback>
                                    {user.firstName?.split(" ").slice(0, 2).map(name => name[0]).join("").toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            Dashboard
                        </div>

                        <div className="flex flex-col w-full gap-3">
                        <div className="flex items-center justify-between bg-input rounded-md px-4 py-2">
                            <div className="flex items-center gap-2">
                                <Cake size={20} className="text-orange" />
                                <span className="text-muted-foreground font-medium">Joined</span>
                            </div>
                            <span className="text-muted-foreground">
                                {new Date(userData.data.created_at).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </span>
                        </div>
                        <div className="flex items-center justify-between bg-input rounded-md px-4 py-2">
                            <div className="flex items-center gap-2">
                                <BadgeCheck size={20} className="text-orange" />
                                <span className="text-muted-foreground font-medium">Verified</span>
                            </div>
                            <span className="text-muted-foreground ">
                                {userData.data.verified ? 'Yes' : 'No'}
                            </span>
                        </div>


                            <div className="flex items-center justify-between bg-input rounded-md px-4 py-2">
                                <div className="flex items-center gap-2">
                                    <CircleCheck size={20} className="text-orange" />
                                    <span className="text-muted-foreground font-medium">Posts Made</span>
                                </div>
                                <span className="text-muted-foreground">{myPosts.postCount?.postsMade ?? 0}</span>
                            </div>
                            <div className="flex items-center justify-between bg-input rounded-md px-4 py-2">
                                <div className="flex items-center gap-2">
                                    <Signpost size={20} className="text-orange" />
                                    <span className="text-muted-foreground font-medium">Posts Available</span>
                                </div>
                                <span className="text-muted-foreground">{myPosts.postCount?.postsAvailable ?? 0}</span>
                            </div>
                            <div className="flex items-center justify-between bg-input rounded-md px-4 py-2">
                                <div className="flex items-center gap-2">
                                    <Radio size={20} className="text-orange" />
                                    <span className="text-muted-foreground font-medium">Boosts Remaining</span>
                                </div>
                                <span className="text-muted-foreground">{myPosts.postCount?.postsAvailable ?? 0}</span>
                            </div>
                        </div>


                    </div>
                    <div id="bot" className="w-full flex flex-col justify-center items-center">
                        <Button className="bg-input hover:bg-orange cursor-pointer text-muted-foreground hover:text-background w-full">Get more posts</Button>
                        <a href="/myposts" className=" font-semibold p-2 rounded-md text-sm text-center bg-input hover:bg-orange cursor-pointer text-muted-foreground hover:text-background w-full mt-2">View my posts</a>
                    </div>
                </div>
            </div>

        </div>


    )
}