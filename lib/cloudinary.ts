import { v2 as cloudinary } from "cloudinary";

const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const key = process.env.CLOUDINARY_API_KEY;
const sec = process.env.CLOUDINARY_API_SECRET;

cloudinary.config({
  cloud_name: cloud,
  api_key: key,
  api_secret: sec,
});

export async function uploadImage(str: string): Promise<string> {
  if (!cloud || !key || !sec) {
    throw new Error("Missing env vars");
  }

  try {
    const res = await cloudinary.uploader.upload(str, {
      invalidate: true,
      overwrite: true,
      resource_type: "auto",
      folder: "ecommerce-products",
    });
    
    if (!res.secure_url) throw new Error("No url returned");
    
    return res.secure_url;
  } catch (err) {
    console.error(err);
    throw new Error("Upload failed");
  }
}

export default cloudinary;