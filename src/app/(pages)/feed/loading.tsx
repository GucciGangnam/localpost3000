
import CardSkeleton from "@/components/feed/card-skeleton"

export default function Loading() {

    return (
        <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 p-4'>

            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />


        </div>
    )
}