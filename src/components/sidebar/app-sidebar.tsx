import { Home, LogOut, NewspaperIcon, Speech, Calendar1, Tag, Gamepad2, Pin, Signpost } from "lucide-react"
import { Button } from "../ui/button"
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
    ClerkProvider,
    SignInButton,
    SignUpButton,
    SignedIn,
    SignedOut,
    UserButton,
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

const personalItems = [
    {
        title: "My Posts",
        url: "/myposts",
        icon: Signpost,
    },
    {
        title: "Following",
        url: "/profile/bookmarks",
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
                        <div className="flex flex-col gap-1">
                            <SignUpButton mode="modal">
                                <Button className="cursor-pointer">Sign up</Button>
                            </SignUpButton>
                            <SignInButton mode="modal">
                                <Button className="cursor-pointer">Log in</Button>
                            </SignInButton>
                        </div>
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
                    </SignedIn>
                    <Separator className="mt-2 mb-2" />

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

            <SidebarFooter>
                <Separator className="mt-2 mb-2" />
                <div className="flex items-center gap-2 rounded-sm p-2  hover:bg-muted cursor-pointer text-sm">
                    <LogOut />
                    <SignOutButton>Log out</SignOutButton>
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}
