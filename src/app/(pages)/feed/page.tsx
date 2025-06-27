'use client'

import { useEffect, useState } from 'react';
import Card from "@/components/feed/card";
import NoPostsFound from "@/components/feed/no-posts-found";
import { getAllPostsByNewest, getAllPostsByOldest, getAllPostsByHot } from "@/app/actions/post";
import { redirect, useRouter, useSearchParams } from 'next/navigation';
import Loading from "./loading";
import { Button } from '@/components/ui/button';

interface PostForClient {
    id: string;
    ownerId: string;
    owner: string;
    ownerAvatar: string;
    timeStamp: number;
    content: string;
    attachment: string | null;
    category: string;
    hotness: number;
}


export default function FeedPage() {
    const [posts, setPosts] = useState<PostForClient[]>([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [offSet, setOffset] = useState<number>(0);
    const [fetchingMore, setFetchingmore] = useState(false);
    const [allPostsFetched, setAllPostsFetched] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const filter = searchParams.get('filter') || 'all';
    const sort = searchParams.get('sort') || 'hot';

    const filters = ['all', 'news', 'discuss', 'event', 'commercial'];
    const sorts = ['hot', 'newest', 'oldest'];

    // Get user location on mount
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                () => {
                    redirect("/")
                    // Set default location or handle error
                }
            );
        } else {
            redirect("/");
        }
    }, []);

    // Fetch initial posts function 
    const fetchPosts = async () => {
        if (!userLocation) return;
        // Validate params
        if (!filters.includes(filter) || !sorts.includes(sort)) {
            router.push('/feed?filter=all&sort=hot');
            return;
        }
        setLoading(true);
        try {
            let response;
            if (sort === 'newest') {
                response = await getAllPostsByNewest(
                    filter as 'all' | 'news' | 'discuss' | 'event' | 'commercial',
                    userLocation.lng,
                    userLocation.lat,
                    0
                );
            } else if (sort === 'oldest') {
                response = await getAllPostsByOldest(
                    filter as 'all' | 'news' | 'discuss' | 'event' | 'commercial',
                    userLocation.lng,
                    userLocation.lat,
                    0
                );
            } else {
                response = await getAllPostsByHot(
                    filter as 'all' | 'news' | 'discuss' | 'event' | 'commercial',
                    userLocation.lng,
                    userLocation.lat,
                    0
                );
            }
            setPosts(response.data ?? []);
            setOffset(response.data ? response.data.length : 0); // Increment pagination for next fetch
            if (response.data && response.data.length < 20) {
                setAllPostsFetched(true); // No more posts to fetch
            }
            

        } catch (error) {
            console.error('Error fetching posts:', error);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch 20 more function 
        const fetchMorePosts = async () => {
            setFetchingmore(true);
        if (!userLocation) return;
        // Validate params
        if (!filters.includes(filter) || !sorts.includes(sort)) {
            router.push('/feed?filter=all&sort=hot');
            return;
        }
        try {
            let response;
            if (sort === 'newest') {
                response = await getAllPostsByNewest(
                    filter as 'all' | 'news' | 'discuss' | 'event' | 'commercial',
                    userLocation.lng,
                    userLocation.lat,
                    offSet
                );
            } else if (sort === 'oldest') {
                response = await getAllPostsByOldest(
                    filter as 'all' | 'news' | 'discuss' | 'event' | 'commercial',
                    userLocation.lng,
                    userLocation.lat,
                    offSet
                );
            } else {
                response = await getAllPostsByHot(
                    filter as 'all' | 'news' | 'discuss' | 'event' | 'commercial',
                    userLocation.lng,
                    userLocation.lat,
                    offSet
                );
            }
            setPosts(prevPosts => [...prevPosts, ...(response.data ?? [])]);
            setOffset(prevOffset => prevOffset + (response.data ? response.data.length : 0)); // Increment pagination for next fetch
            if (response.data && response.data.length < 20) {
                setAllPostsFetched(true); // No more posts to fetch
            }
            if (response.data && response.data.length === 0) {
                setAllPostsFetched(true); // No more posts to fetch
            }

        } catch (error) {
            console.error('Error fetching posts:', error);
            setPosts([]);
        } finally {
            setLoading(false);
            setFetchingmore(false);
        }
    };

    // Fetch posts when location or params change
    useEffect(() => {
        setOffset(0); // Reset offset when filter or sort changes
        setAllPostsFetched(false); // Reset allPostsFetched when filter or sort changes
        fetchPosts();
    }, [userLocation, filter, sort, router]);

    if (loading) {
        return <Loading />
    }

    return (
        <>
            {posts.length === 0 ? <NoPostsFound /> :
                <div id="page-container" className="flex justify-center w-full">
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 w-full'>
                        {posts.map((post) => (
                            <Card key={post.id} post={post} />
                        ))}
                    </div>
                </div>
            }
            <div id='Footer' className='flex justify-center items-center p-4'>
                <div className='text-sm text-muted-foreground flex  flex-col'>
                    {posts.length} posts loaded
                    {!allPostsFetched && <Button onClick={fetchMorePosts}>{fetchingMore ? 'Loading...' : 'Load more'}</Button>}
                </div>
            </div>
        </>
    );
}