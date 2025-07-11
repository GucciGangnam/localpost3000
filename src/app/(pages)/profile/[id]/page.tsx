import { notFound } from 'next/navigation';
import { getUserInfo } from '@/app/actions/user';
// Ensure these imports are correct based on your project structure
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar'; // Assuming @radix-ui/react-avatar is correctly installed and configured
import { BadgeCheck, Cake, Signpost, Ellipsis } from 'lucide-react'; // Assuming lucide-react is correctly installed

// IMPORTANT: Updated PageProps interface.
// 'params' is now typed as a Promise that resolves to an object with an 'id' string.
interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
    // IMPORTANT: Await the 'params' Promise first to get the actual object.
    // Then, destructure 'id' from the resolved object.
    const { id } = await params;

    // Check if id exists. If not, return notFound().
    if (!id) {
        return notFound();
    }

    // Fetch user data based on the ID
    const user = await getUserInfo(id);
    console.log(user); // Keep this for debugging if needed

    // Check if user or user.data is null/undefined before proceeding
    if (!user || !user.data) {
        return <div className="p-4">User not found</div>;
    }

    return (
        <div className="p-4 flex items-center flex-col sm:flex-row sm:items-start gap-8 mt-4 max-h-screen">

            <div id="Left" className="w-full flex flex-col gap-8 max-w-130"> {/* Consider using Tailwind's max-w-xs, max-w-sm, etc. for responsiveness */}

                <div id="NameAndPhoto" className="rounded-md flex">
                    <div id="Left" className="flex items-center gap-4">
                        {/* Ensure Avatar components are correctly implemented and styled */}
                        <Avatar className="w-20 h-20 rounded-full overflow-hidden border-2 border-muted">
                            <AvatarImage src={user.data.avatar} className="w-full h-full object-cover rounded-full" />
                            <AvatarFallback className="w-full h-full flex items-center justify-center rounded-full bg-muted">
                                {user.data.first_name?.split(" ").slice(0, 2).map((name: string) => name[0]).join("").toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    <div id="right" className="grow flex justify-center items-center font-bold">
                        {user.data.first_name} {user.data.last_name}
                    </div>
                </div>

                <div id="Bio" className="rounded-md flex gap-2 flex-col">
                    <p className="whitespace-pre-wrap">{user.data.bio}</p>
                </div>

                <div id="buttos-container" className="flex flex-col gap-2">
                    {/* Ensure button styling is consistent with your design system */}
                    <button className="bg-muted hover:bg-input text-muted-foreground rounded-md p-2 flex justify-center items-center gap-2">
                        <Ellipsis size={20} color="var(--muted-foreground)" />
                    </button>
                </div>

            </div>


            <div id="Right" className="max-h-full w-full flex flex-col gap-2 max-w-130 bg-muted rounded-md p-2">

                <span className="flex items-center gap-2 text-muted-foreground">
                    <Cake size={18} />
                    Joined&nbsp;
                    {new Date(user.data.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}
                </span>
                <span className="flex items-center gap-2 text-muted-foreground">
                    <BadgeCheck size={18} />
                    {user.data.verified ? 'Verified' : 'Not Verified'}
                </span>
                <span className="flex items-center gap-2 text-muted-foreground">
                    <Signpost size={18} />
                    {user.data.total_posts} active post{user.data.total_posts === 1 ? '' : 's'}
                </span>

            </div>


        </div>
    )
}