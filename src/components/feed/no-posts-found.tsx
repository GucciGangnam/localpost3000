// IMPORTS 
import { Ripple } from "../magicui/ripple"
import { MapPinOff } from "lucide-react"
import NewPostDialog from "../navbar/new-post-dialog"


// COMPONENT
export default function NoPostsFound() {
    return (
        <div className="flex flex-col items-center justify-center w-full h-full relative overflow-hidden" >
            <Ripple mainCircleOpacity={0.2} color="blue" />
            <MapPinOff/>
            <p>No posts aroud here, unfortunatly</p>
            <p>Create a new post to be the first</p>
            <NewPostDialog />

            
        </div>
    )
}