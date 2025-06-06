// IMPORTS 
import CardSkeleton from "@/components/feed/card-skeleton"


// COMPONENT 
export default function Loading() {

    return (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 p-4 w-full'>
            <div className="p-2">
                <p className="font-bold mb-2">Post</p>
                <CardSkeleton />
            </div>

            <div className=" p-2 rounded-md flex flex-col">
                <p className="font-bold mb-2">Comments</p>
                <div className="bg-muted p-4 rounded-md flex flex-col gap-2">

                    <CardSkeleton />
                    <CardSkeleton />
                </div>
            </div>
        </div>
    );
}