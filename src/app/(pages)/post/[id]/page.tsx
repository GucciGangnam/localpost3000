



interface PageParams {
    id: string;
}

export default async function Page({ params }: { params: PageParams }) {
    const { id } = await params; // Get the id from the params object

    // Find that post and all comments 

    // if post not exist tehn do somethign 


    return (
        <div className="bg-red-300 p-4 flex justify-center items-center">
            The post id is {id}
        </div>
    );
}