import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(base64Image: string): Promise<string> {
  try {
    // Check if Cloudinary is configured
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      throw new Error("Cloudinary configuration is missing. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env.local file.");
    }

    const result = await cloudinary.uploader.upload(base64Image, {
      folder: "ecommerce-products",
      resource_type: "auto",
      overwrite: true,
      invalidate: true,
    });
    
    if (!result.secure_url) {
      throw new Error("No URL returned from Cloudinary");
    }
    
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    if (error instanceof Error) {
      throw new Error(`Image upload failed: ${error.message}`);
    }
    throw new Error("Failed to upload image");
  }
}

export default cloudinary;
