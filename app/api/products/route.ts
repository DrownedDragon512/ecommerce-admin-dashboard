import { z } from "zod";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { uploadImage } from "@/lib/cloudinary";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  price: z.coerce.number().positive(),
  stock: z.coerce.number().int().nonnegative(),
  image: z.string().optional(),
});

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();

    const products = await db
      .collection("products")
      .find({ userId: user.userId })
      .sort({ createdAt: -1 })
      .toArray();

    const normalized = products.map((product) => ({
      ...product,
      _id: (product._id as ObjectId).toHexString(),
    }));

    return NextResponse.json({ products: normalized }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch products", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = productSchema.parse(body);

    const db = await getDb();

    let imageUrl = "";
    if (validatedData.image) {
      // Upload to Cloudinary if image is base64
      if (validatedData.image.startsWith("data:image")) {
        try {
          imageUrl = await uploadImage(validatedData.image);
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          const errorMessage = uploadError instanceof Error ? uploadError.message : "Unknown error";
          return NextResponse.json(
            { error: `Failed to upload image: ${errorMessage}` },
            { status: 500 }
          );
        }
      } else {
        // Already a URL
        imageUrl = validatedData.image;
      }
    }

    const insertResult = await db.collection("products").insertOne({
      name: validatedData.name,
      description: validatedData.description,
      category: validatedData.category,
      price: validatedData.price,
      stock: validatedData.stock,
      image: imageUrl,
      userId: user.userId,
      createdAt: new Date(),
    });

    return NextResponse.json(
      {
        message: "Product created successfully",
        productId: insertResult.insertedId.toHexString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create product", error);

    const isValidationError = error instanceof z.ZodError;
    return NextResponse.json(
      { error: isValidationError ? "Invalid product data" : `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: isValidationError ? 400 : 500 }
    );
  }
}
