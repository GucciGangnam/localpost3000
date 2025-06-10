
import { CreditCard, KeyRound, GlobeLock } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { auth, clerkClient } from '@clerk/nextjs/server';
import { getUserInfo } from "../../actions/user";
import { getPersonalPosts } from "../../actions/post";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import BioEditor from "./bioEditor";
import { ShineBorder } from "@/components/magicui/shine-border";




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
    if (!userData.success) {
        console.log("User data not found");
        return <div>User data not found</div>;
    }
    const myPosts = await getPersonalPosts();
    const { bio } = userData.data;
    const userAvatar = user.imageUrl;




    return (
        <div className="p-4 flex justify-center items-center flex-col sm:flex-row sm:items-start gap-8 mt-4 max-h-screen ">

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
                <div id="Title" className="font-bold">My Posts</div>

                <div className=" rounded-md min-h-40 flex flex-col gap-4 justify-center items-center">
                    <div id="Info" className="bg-muted rounded-md p-2 flex flex-col items-center gap-4 w-full">
                        <div id="top" className="font-bold w-full flex gap-4 items-center">
                            <Avatar className="w-8 h-8">
                                <AvatarImage src={userAvatar} />
                                <AvatarFallback>
                                    {user.firstName?.split(" ").slice(0, 2).map(name => name[0]).join("").toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            Your Posts
                        </div>
                        <div id="mid" className="flex w-full justify-around items-center gap-4">
                            <div id="Posts-Made" className=" h-full flex flex-col items-center justify-center bg-input rounded-md p-1 px-2 gap-1 text-muted-foreground min-w-max aspect-square">
                                <div id="NumberOfPostsMade" className="text-4xl font-bold">
                                    {myPosts.postCount?.postsMade}
                                </div>
                                <div className="text-xs text-muted-foreground ">
                                    Posts made
                                </div>
                            </div>
                            <div id="Posts-Available" className=" h-full flex flex-col items-center justify-center bg-input rounded-md p-1 px-2 gap-1 text-muted-foreground min-w-max aspect-square">
                                <div id="NumberOfPostsAvailable" className="text-4xl font-bold">
                                    {myPosts.postCount?.postsAvailable}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Posts available
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


        </div>
    )
}