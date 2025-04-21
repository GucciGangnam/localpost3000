
// IMPORTS 
import Card from "@/components/feed/card";
import CardSkeleton from "@/components/feed/card-skeleton";
import Card2 from "@/components/feed/card2";






export default async function FeedPage() {

    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate random number
    const randomNumber = Math.floor(Math.random() * 100);




    return (
        <div className='border-2 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 p-4'>


            <Card />
            <Card />
            <Card2 />
            <Card />
            <Card />
            <Card2 />
            <Card2 />
            <Card />
            <Card />

        </div>
    )
}