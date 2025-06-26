// IMPORTS 

// COMPONENT 

export default function DropZone() {
    return (
        <div className="flex items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
            <div className="text-center">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-12 h-12 mx-auto mb-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16v4m10-4v4m-5-4v4m8-8h2a2 2 0 012 2v6a2 2 0 01-2 2h-6a2 2 0 01-2-2v-6a2 2 0 012-2h2m0 0V8a4 4 0 00-8 0v1m8 0H9" />
                </svg>
                <p className="text-gray-500">Drag and drop your files here, or click to select files</p>
            </div>
        </div>
    );
}
