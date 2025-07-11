

import { Home, LogOut, NewspaperIcon, Speech, Calendar1, Tag, Gamepad2, Pin, Signpost, CircleUserRound } from "lucide-react"
import { Separator } from "../ui/separator"


import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

import UserSpace from "./user-space"


// CLERK
import {
    SignUpButton,
    SignedIn,
    SignedOut,
    SignOutButton
} from '@clerk/nextjs'

// Menu items.
const items = [
    {
        title: "All",
        url: "/feed?filter=all&sort=hot",
        icon: Home,
    },
    {
        title: "News",
        url: "/feed?filter=news&sort=hot",
        icon: NewspaperIcon,
    },
    {
        title: "Discussion",
        url: "/feed?filter=discuss&sort=hot",
        icon: Speech,
    },
    {
        title: "Events",
        url: "/feed?filter=event&sort=hot",
        icon: Calendar1,
    },
    {
        title: "Commercial",
        url: "/feed?filter=commercial&sort=hot",
        icon: Tag,
    },
    {
        title: "Games",
        url: "/games",
        icon: Gamepad2,
    },
]

const authItems = [
    {
        title: "Account",
        url: "/feed?filter=all&sort=hot",
        icon: CircleUserRound,
    }
]

const personalItems = [
    {
        title: "My Posts",
        url: "/myposts",
        icon: Signpost,
    },
    {
        title: "Pin Board",
        url: "/pinboard",
        icon: Pin,
    },
]


// COMPONENT
export function AppSidebar() {



    return (
        <Sidebar className="text-muted-foreground">
            <SidebarContent>
                <SidebarGroup>

                    <SidebarGroupLabel className="text-xl">
                        LocalPost
                    </SidebarGroupLabel>

                    {/*  SIGNED IN */}
                    <SignedIn>
                        <UserSpace />
                    </SignedIn>

                    {/*  SIGNED OUT */}
                    <SignedOut>

                        <SidebarGroupContent>
                            <SidebarMenu className="text-muted-foreground cursor-pointer">
                                {authItems.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild>
                                            <SignUpButton mode="modal">
                                                <span className="cursor-pointer">
                                                    <CircleUserRound />
                                                    <span>{item.title}</span>
                                                </span>
                                            </SignUpButton>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>

                    </SignedOut>

                    <Separator className="mt-2 mb-2" />

                    <SignedIn>
                        <SidebarGroupContent>
                            <SidebarGroupLabel>For you</SidebarGroupLabel>
                            <SidebarMenu className="text-muted-foreground">
                                {personalItems.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild>
                                            <a href={item.url}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                        <Separator className="mt-2 mb-2" />
                    </SignedIn>

                    <SidebarGroupContent>
                        <SidebarGroupLabel>Sections</SidebarGroupLabel>
                        <SidebarMenu className="text-muted-foreground">
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>

                </SidebarGroup>
            </SidebarContent>

            <SignedIn>
                <SidebarFooter>
                    <Separator className="mt-2 mb-2" />
                    <div className="flex items-center gap-2 rounded-sm p-2  hover:bg-muted cursor-pointer text-sm">
                        <SignOutButton><LogOut /></SignOutButton>
                    </div>
                </SidebarFooter>
            </SignedIn >

        </Sidebar>
    )
}
