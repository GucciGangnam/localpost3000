// IMPORTS 
import { TriangleAlert } from "lucide-react"




// COMPONENT 
export default function InvalidFeed() { 
    return (
        <div className="w-full flex flex-col items-center justify-center">
            <div className="flex flex-col items-center justify-center">
                <TriangleAlert className="w-10 h-10 text-orange" />
                <h1 className="text-xl font-bold">Invalid URL</h1>
                <p className="text-sm text-muted-foreground">Please select one of the feed settings from above.</p>
            </div>
        </div>
    )
}