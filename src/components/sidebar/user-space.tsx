'use client'
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { useSidebar } from "@/components/ui/sidebar"


// Menu items.




export default function UserSpace() {
    const { user } = useUser();
    const {open} = useSidebar()

    return (
        <a 
        href='/myprofile'
        className='flex flex-col rounded-sm p-2 pl-1 cursor-pointer hover:bg-muted'>
            <div
                id='top'
                className='flex items-center cursor-pointer rounded-md gap-2 '

            >
                <Image
                    src={user?.imageUrl || '/default-avatar.png'}
                    width={35}
                    height={35}
                    alt="Avatar"
                    className="rounded-full"
                    style={{ aspectRatio: "1/1", borderRadius: '100%' }}
                />
                {open && <div>{user?.fullName || "User Name"}</div> }
                
            </div>



        </a>

    );
}