// lib/cloudinaryUpload.ts
import { toast } from "sonner"; // Assuming you want to use sonner for toasts

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

if (!CLOUD_NAME || !UPLOAD_PRESET) {
    console.error("Cloudinary environment variables are not set correctly.");
    // You might want to throw an error or handle this more gracefully
}

export const uploadImageToCloudinary = async (file: File): Promise<string> => {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
        toast.error("Cloudinary configuration missing.");
        throw new Error("Cloudinary configuration missing.");
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Cloudinary upload error:", errorData);
            toast.error(`Image upload failed: ${errorData.error.message || 'Unknown error'}`);
            throw new Error(errorData.error.message || "Cloudinary upload failed");
        }

        const data = await response.json();
        return data.secure_url; // This is the public URL of the uploaded image
    } catch (error) {
        console.error("Error during Cloudinary upload:", error);
        toast.error("An unexpected error occurred during image upload.");
        throw error;
    }
};