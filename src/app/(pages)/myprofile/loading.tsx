// IMPORTS 
import CardSkeleton from "@/components/feed/card-skeleton"
import { Cake, BadgeCheck, CircleCheck, Signpost, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";



// TYPES 

// COMPONNENT
export default function Loading() {
    return (
        <div className="p-4 flex items-center flex-col sm:flex-row sm:items-start gap-8 mt-4 max-h-screen ">

            <div id="Left" className=" w-full flex flex-col gap-8 max-w-130">

                <div id="NameAndPhoto" className="rounded-md flex">
                    <div id="Left" className="flex items-center gap-4 border-2 border-muted rounded-md p-2 min-w-[180px] min-h-[75px]">

                        <div className="flex items-center gap-4 w-full">
                            <div className="bg-muted rounded-full w-[75px] h-[75px] animate-pulse" />
                            <div className="flex flex-col gap-2 flex-1">
                                <div className="bg-muted h-6 w-24 rounded animate-pulse" />
                            </div>
                        </div>
                    </div>

                    <div id="right" className="grow flex justify-center items-center">
                        <Button className="bg-muted px-2 py-1 rounded-sm text-muted-foreground text-sm cursor-pointer hover:bg-input">Loading</Button>
                    </div>
                </div>

                <div id="Bio" className=" rounded-md flex gap-2 flex-col">
                    <CardSkeleton />
                </div>

                <div id="buttos-container" className="flex flex-col gap-2">

                    <div className="bg-muted h-10 w-full rounded-md animate-pulse" />
                    <div className="bg-muted h-10 w-full rounded-md animate-pulse" />
                    <div className="bg-muted h-10 w-full rounded-md animate-pulse" />

                </div>

            </div>


            <div id="Right" className="  max-h-full w-full flex flex-col gap-2 max-w-130">

                <div className=" rounded-md min-h-40 flex flex-col gap-4 justify-center items-center">
                    <div id="Info" className="bg-muted rounded-md p-2 flex flex-col items-center gap-4 w-full">
                        <div id="top" className="font-bold w-full flex gap-4 items-center">
                            Avatr
                            Dashboard
                        </div>

                        <div className="flex flex-col w-full gap-3">
                            <div className="flex items-center justify-between bg-input rounded-md px-4 py-2">
                                <div className="flex items-center gap-2">
                                    <Cake size={20} className="text-orange" />
                                    <span className="text-muted-foreground font-medium">Joined</span>
                                </div>
                                <span className="text-muted-foreground">
                                    Loading
                                </span>
                            </div>
                            <div className="flex items-center justify-between bg-input rounded-md px-4 py-2">
                                <div className="flex items-center gap-2">
                                    <BadgeCheck size={20} className="text-orange" />
                                    <span className="text-muted-foreground font-medium">Verified</span>
                                </div>
                                <span className="text-muted-foreground ">
                                    Loading
                                </span>
                            </div>


                            <div className="flex items-center justify-between bg-input rounded-md px-4 py-2">
                                <div className="flex items-center gap-2">
                                    <CircleCheck size={20} className="text-orange" />
                                    <span className="text-muted-foreground font-medium">Posts Made</span>
                                </div>
                                <span className="text-muted-foreground">Loading</span>
                            </div>
                            <div className="flex items-center justify-between bg-input rounded-md px-4 py-2">
                                <div className="flex items-center gap-2">
                                    <Signpost size={20} className="text-orange" />
                                    <span className="text-muted-foreground font-medium">Posts Available</span>
                                </div>
                                <span className="text-muted-foreground">Loading</span>
                            </div>
                            <div className="flex items-center justify-between bg-input rounded-md px-4 py-2">
                                <div className="flex items-center gap-2">
                                    <Radio size={20} className="text-orange" />
                                    <span className="text-muted-foreground font-medium">Boosts Remaining</span>
                                </div>
                                <span className="text-muted-foreground">Loading</span>
                            </div>
                        </div>


                    </div>
                    <div id="bot" className="w-full flex flex-col justify-center items-center">
                        <Button className="bg-input hover:bg-orange cursor-pointer text-muted-foreground hover:text-background w-full">Loading</Button>
                        <a href="/myposts" className=" font-semibold p-2 rounded-md text-sm text-center bg-input hover:bg-orange cursor-pointer text-muted-foreground hover:text-background w-full mt-2">Loading</a>
                    </div>
                </div>
            </div>

        </div>


    )
}