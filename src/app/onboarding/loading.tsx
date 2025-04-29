'use client'
import { OrbitingCircles } from "@/components/magicui/orbiting-circles";
import { NewspaperIcon, Calendar1, Speech, Tag, Gamepad2, TriangleAlert } from "lucide-react";
import { Ripple } from "@/components/magicui/ripple";



export default function Loading() {
    return (
        <div className="w-screen h-screen flex flex-col items-center justify-center bg-background">
            {/* Ripple */}
            <Ripple className="z-20 overflow-hidden" mainCircleOpacity={0.2} />
            {/* Orbiter - Absolute */}
            <OrbitingCircles path={false} radius={180} className="overflow-hidden top-[50%] left-[50%]">
                <NewspaperIcon color="var(--ring)" />
                <Calendar1 color="var(--ring)" />
                <Speech color="var(--ring)" />
            </OrbitingCircles>
            <OrbitingCircles path={false} radius={100} reverse className="overflow-hidden top-[calc(50%-10px)] left-[calc(50%-10px)]">
                <Tag color="var(--ring)" />
                <NewspaperIcon color="var(--ring)" />
                <Calendar1 color="var(--ring)" />
                <Gamepad2 color="var(--ring)" />
            </OrbitingCircles>
        </div>
    )
}