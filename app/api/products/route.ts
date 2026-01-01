import { z } from "zod";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { uploadImage } from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.coerce.number().positive(),
  stock: z.coerce.number().int().nonnegative(),
  image: z.string().optional(),
});

export async function GET() {
  try {
    const db = await getDb();

    const products = await db
      .collection("products")
      .find({})
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
    const body = await req.json();
    const validatedData = productSchema.parse(body);

    const db = await getDb();

    let imageUrl = "";
    if (validatedData.image) {
      // Upload to Cloudinary if image is base64
      if (validatedData.image.startsWith("data:image")) {
        imageUrl = await uploadImage(validatedData.image);
      } else {
        // Already a URL
        imageUrl = validatedData.image;
      }
    }

    const insertResult = await db.collection("products").insertOne({
      name: validatedData.name,
      description: validatedData.description,
      price: validatedData.price,
      stock: validatedData.stock,
      image: imageUrl,
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
      { error: isValidationError ? "Invalid product data" : "Unexpected error" },
      { status: isValidationError ? 400 : 500 }
    );
  }
}
