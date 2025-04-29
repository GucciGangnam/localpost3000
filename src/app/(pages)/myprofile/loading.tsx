// IMPORTS 
import { Skeleton } from "@/components/ui/skeleton"
import CardSkeleton from "@/components/feed/card-skeleton"
import GenericDivSkeleton from "@/components/feed/generic-div-skeleton"


export default function Loading() {




    return (
        <div className="p-4 flex justify-center items-center flex-col sm:flex-row sm:items-start gap-8 mt-4 ">

            <div id="Left" className=" w-full flex flex-col gap-8 max-w-130">

                <GenericDivSkeleton />
                <GenericDivSkeleton />
            </div>


            <div id="Right" className=" h-full w-full flex flex-col gap-2 max-w-130">

                <CardSkeleton />
            </div>


        </div>
    )
}