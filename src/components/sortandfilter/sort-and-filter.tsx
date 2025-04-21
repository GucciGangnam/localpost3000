
'use client'

//IMPORTS 
import { NewspaperIcon, Speech, Calendar1, Tag } from "lucide-react"
import { useRouter, useSearchParams } from 'next/navigation';


// COMPONENET 
export default function SorterAndFilter() {

    const router = useRouter();
    const searchParams = useSearchParams();
    const currentSort = searchParams.get('sort') || 'hot'; // Default to 'hot'
    const currentFilter = searchParams.get('filter') || 'all'; // Default to 'all'


    const removeFilter = (clickedLink: string) => {

        if (clickedLink === currentFilter) {
            router.push(`/feed?filter=all&sort=${currentSort}`)
        } else {
            return;
        }
    }





    return (
        <div id="container" className="w-full flex flex-col items-center justify-center">



            <div id="sorter" className="p-1 w-80 max-w-full flex gap-2 text-sm">
                <a
                    className={`rounded-sm py- w-full text-center flex justify-center items-center ${currentSort === 'hot' ? 'bg-orange text-muted' : 'text-muted-foreground bg-muted hover:bg-input'
                        }`}
                    href={`/feed?filter=${currentFilter}&sort=hot`}
                >
                    Hot
                </a>
                <a
                    className={`rounded-sm py-0.5 w-full text-center flex justify-center items-center ${currentSort === 'oldest' ? 'bg-orange text-muted' : 'text-muted-foreground bg-muted hover:bg-input'
                        }`}
                    href={`/feed?filter=${currentFilter}&sort=oldest`}
                >
                    Oldest
                </a>
                <a
                    className={`rounded-sm py-0.5 w-full text-center flex justify-center items-center ${currentSort === 'newest' ? 'bg-orange text-muted' : 'text-muted-foreground bg-muted hover:bg-input'
                        }`}
                    href={`/feed?filter=${currentFilter}&sort=newest`}
                >
                    Newest
                </a>
            </div>

            <div id="filter" className="p-1 w-125 max-w-full flex gap-2 text-sm justify-center flex-wrap">
                <a
                    onClick={() => removeFilter('news')}
                    href={`/feed?filter=news&sort=${currentSort}`}
                    className={`text-muted-foreground bg-muted hover:bg-input rounded-sm p-1 pr-2 w-fit flex items-center gap-1 ${currentFilter === 'news' ? 'text-orange' : ''}`}>
                    <NewspaperIcon size={15} color={currentFilter === 'news' ? 'var(--orange)' : undefined} />
                    News
                </a>
                <a
                    onClick={() => removeFilter('discuss')}
                    href={`/feed?filter=discuss&sort=${currentSort}`}
                    className={`text-muted-foreground bg-muted hover:bg-input rounded-sm p-1 pr-2 w-fit flex items-center gap-1 ${currentFilter === 'discuss' ? 'text-orange' : ''}`}>
                    <Speech size={15} color={currentFilter === 'discuss' ? 'var(--orange)' : undefined} />
                    Discuss
                </a>
                <a
                    onClick={() => removeFilter('events')}
                    href={`/feed?filter=events&sort=${currentSort}`}
                    className={`text-muted-foreground bg-muted hover:bg-input rounded-sm p-1 pr-2 w-fit flex items-center gap-1 ${currentFilter === 'events' ? 'text-orange' : ''}`}>
                    <Calendar1 size={15} color={currentFilter === 'events' ? 'var(--orange)' : undefined} />
                    Events
                </a>
                <a
                    onClick={() => removeFilter('commercial')}
                    href={`/feed?filter=commercial&sort=${currentSort}`}
                    className={`text-muted-foreground bg-muted hover:bg-input rounded-sm p-1 pr-2 w-fit flex items-center gap-1 ${currentFilter === 'commercial' ? 'text-orange' : ''}`}>
                    <Tag size={15} color={currentFilter === 'commercial' ? 'var(--orange)' : undefined} />
                    Commercial
                </a>
            </div>
        </div>
    )
}