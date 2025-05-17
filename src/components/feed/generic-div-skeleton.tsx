//  IMPORTS 
import { Skeleton } from "@/components/ui/skeleton"






// COMPONENT
export default function GenericDivSkeleton() {

    return (

        <div className="bg-muted flex flex-col p-2 gap-4 rounded-md row-span-1">

            <Skeleton className="w-full h-10 rounded-full" />
            <Skeleton className="w-full h-10 rounded-full" />

        </div>

    )
}

