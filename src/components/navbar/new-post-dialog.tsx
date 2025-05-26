'use client'
// IMPORTS 
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "../ui/dialog";
import { useUser } from "@clerk/nextjs";
import { Button } from "../ui/button";
import {CirclePlus } from "lucide-react"

// CLERK
import {
    SignInButton,
    SignUpButton,
    SignedIn,
    SignedOut,

} from '@clerk/nextjs'

import NewPostForm from "./new-post-form"

// COMPONNET

export default function NewPostDialog() {

    const { user, isLoaded } = useUser()


    return (
        <>
            <Dialog>
                <DialogTrigger className=" cursor-pointer flex gap-2 items-center">

                    New Post
                    <CirclePlus size={30} className="animate-pulse" />

                </DialogTrigger>

                {/* Signed in */}
                <SignedIn>
                    <NewPostForm/>
                </SignedIn>
                {/* Signed out */}
                <SignedOut>
                    <DialogContent aria-description={"Login Required to make post"} className="flex flex-col gap-2">
                        <DialogTitle>Sign in to make a post</DialogTitle>
                        <div className="flex flex-col gap-1">
                            <SignUpButton mode="modal">
                                <Button className="cursor-pointer">Sign up</Button>
                            </SignUpButton>
                            <SignInButton mode="modal">
                                <Button className="cursor-pointer">Log in</Button>
                            </SignInButton>
                        </div>
                    </DialogContent>
                </SignedOut>

            </Dialog>
        </>
    )
}

