
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


    const navigateSort = (sortBy: 'hot' | 'oldest' | 'newest') => {
        const newSearchParams = new URLSearchParams(searchParams.toString());
        if (sortBy === currentSort) {
            return;
        } else {
            newSearchParams.set('sort', sortBy);
        }

        // Replace the current URL with the new query parameter
        router.push(`/feed?${newSearchParams.toString()}`);
    };

    const navigateFilter = (filterBy: 'news' | 'discuss' | 'commercial' | 'events') => {
        const newSearchParams = new URLSearchParams(searchParams.toString());
        if (filterBy === currentFilter) {
            newSearchParams.set('filter', 'all');
        } else {
            newSearchParams.set('filter', filterBy);
        }

        // Replace the current URL with the new query parameter
        router.push(`/feed?${newSearchParams.toString()}`);
    };


    return (
        <div id="container" className="w-full flex flex-col items-center justify-center">



            <div id="sorter" className="p-1 w-80 max-w-full flex gap-2 text-sm">
                <button onClick={() => { navigateSort('hot') }}
                    className={`rounded-sm py- w-full ${currentSort === 'hot' ? 'bg-orange text-muted' : 'text-muted-foreground bg-muted hover:bg-input'
                        }`}
                >
                    Hot
                </button>
                <button onClick={() => { navigateSort('oldest') }}
                    className={`rounded-sm py-0.5 w-full ${currentSort === 'oldest' ? 'bg-orange text-muted' : 'text-muted-foreground bg-muted hover:bg-input'
                        }`}
                >
                    Oldest
                </button>
                <button onClick={() => { navigateSort('newest') }}
                    className={`rounded-sm py-0.5 w-full ${currentSort === 'newest' ? 'bg-orange text-muted' : 'text-muted-foreground bg-muted hover:bg-input'
                        }`}
                >
                    Newest
                </button>
            </div>

            <div id="filter" className="p-1 w-125 max-w-full flex gap-2 text-sm justify-center flex-wrap">
                <button
                    onClick={() => { navigateFilter('news') }}
                    className={`text-muted-foreground bg-muted hover:bg-input rounded-sm p-1 pr-2 w-fit flex items-center gap-1 ${currentFilter === 'news' ? 'text-orange' : ''}`}>
                    <NewspaperIcon size={15} color={currentFilter === 'news' ? 'var(--orange)' : undefined} />
                    News
                </button>
                <button
                    onClick={() => { navigateFilter('discuss') }}
                    className={`text-muted-foreground bg-muted hover:bg-input rounded-sm p-1 pr-2 w-fit flex items-center gap-1 ${currentFilter === 'discuss' ? 'text-orange' : ''}`}>
                    <Speech size={15} color={currentFilter === 'discuss' ? 'var(--orange)' : undefined}  />
                    Discuss
                </button>
                <button
                    onClick={() => { navigateFilter('events') }}
                    className={`text-muted-foreground bg-muted hover:bg-input rounded-sm p-1 pr-2 w-fit flex items-center gap-1 ${currentFilter === 'events' ? 'text-orange' : ''}`}>
                    <Calendar1 size={15} color={currentFilter === 'events' ? 'var(--orange)' : undefined}  />
                    Events
                </button>
                <button
                    onClick={() => { navigateFilter('commercial') }}
                    className={`text-muted-foreground bg-muted hover:bg-input rounded-sm p-1 pr-2 w-fit flex items-center gap-1 ${currentFilter === 'commercial' ? 'text-orange' : ''}`}>
                    <Tag size={15} color={currentFilter === 'commercial' ? 'var(--orange)' : undefined}  />
                    Commercial
                </button>
            </div>
        </div>
    )
}