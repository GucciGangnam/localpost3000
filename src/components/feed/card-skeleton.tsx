//  IMPORTS 
import { Skeleton } from "@/components/ui/skeleton"






// COMPONENT
export default function CardSkeleton() {

    return (

        <div className="bg-muted flex p-2 gap-2 rounded-md row-span-1">


            <div id="left">
                <Skeleton className="w-[35px] h-[35px] rounded-full" />
            </div>


            <div id="right" className="flex flex-col gap-2 grow justify-between">

                <div id="top" className="gap-2 flex flex-col">
                    <Skeleton className="w-[25%] h-4 rounded-full" />
                    <Skeleton className="w-[25%] h-4 rounded-full" />
                </div>


                <div id="middle" className="gap-2 flex flex-col">
                    <Skeleton className="w-full h-5 rounded-full" />
                    <Skeleton className="w-full h-5 rounded-full" />

                </div>

                <div id="bottom" className="justify-end flex">
                <Skeleton className="w-[50%] h-5 rounded-full" />
                </div>

            </div>




        </div>

    )
}

