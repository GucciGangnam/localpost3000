'use client'

import { useEffect, useState } from 'react';
import Card from "@/components/feed/card";
import NoPostsFound from "@/components/feed/no-posts-found";
import { getAllPostsByNewest, getAllPostsByOldest, getAllPostsByHot } from "@/app/actions/post";
import { redirect, useRouter, useSearchParams } from 'next/navigation';
import Loading from "./loading";

interface PostForClient {
    id: string;
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

    // Fetch posts when location or params change
    useEffect(() => {
        if (!userLocation) return;

        // Validate params
        if (!filters.includes(filter) || !sorts.includes(sort)) {
            router.push('/feed?filter=all&sort=hot');
            return;
        }

        const fetchPosts = async () => {
            setLoading(true);
            try {
                let response;
                if (sort === 'newest') {
                    response = await getAllPostsByNewest(
                        filter as 'all' | 'news' | 'discuss' | 'event' | 'commercial',
                        userLocation.lng,
                        userLocation.lat
                    );
                } else if (sort === 'oldest') {
                    response = await getAllPostsByOldest(
                        filter as 'all' | 'news' | 'discuss' | 'event' | 'commercial',
                        userLocation.lng,
                        userLocation.lat
                    );
                } else {
                    response = await getAllPostsByHot(
                        filter as 'all' | 'news' | 'discuss' | 'event' | 'commercial',
                        userLocation.lng,
                        userLocation.lat
                    );
                }
                setPosts(response.data ?? []);
            } catch (error) {
                console.error('Error fetching posts:', error);
                setPosts([]);
            } finally {
                setLoading(false);
            }
        };

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
        </>
    );
}