'use client'
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { Verified } from 'lucide-react';


export default function UserSpaceProfile() {

    const { user } = useUser();


    return (

        <>
            <Image
                src={user?.imageUrl || '/default-avatar.png'}
                width={75}
                height={75}
                alt="Avatar"
                className="rounded-full"
                style={{ aspectRatio: "1/1", borderRadius: '100%' }}
            />
            <div id="name" className="text-lg ">
                {user?.fullName || "User Name"}
            </div>
            <Verified size={20} fill="var(--orange)" color="var(--background)" />
        </>
    )
}
