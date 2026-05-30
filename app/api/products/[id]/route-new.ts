import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { z } from "zod";

export const dynamic = "force-dynamic";

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.coerce.number().positive(),
  stock: z.coerce.number().int().nonnegative(),
  image: z.string().optional(),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

    if (!productId || !ObjectId.isValid(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const db = await getDb();
    const productsCollection = db.collection("products");

    const product = await productsCollection.findOne({ 
      _id: new ObjectId(productId) 
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const normalized = {
      ...product,
      _id: (product._id as ObjectId).toHexString(),
    };

    return NextResponse.json(normalized, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch product", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const body = await req.json();

    if (!productId || !ObjectId.isValid(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const validatedData = productSchema.parse(body);

    const db = await getDb();
    const productsCollection = db.collection("products");

    const result = await productsCollection.updateOne(
        { _id: new ObjectId(productId) },
        {
          $set: {
            ...validatedData,
            updatedAt: new Date(),
          },
        }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Product updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to update product", error);

    const isValidationError = error instanceof z.ZodError;
    const errorMessage = isValidationError ? "Invalid product data" : "Unexpected error";
    const errorStatus = isValidationError ? 400 : 500;

    return NextResponse.json(
      { error: errorMessage },
      { status: errorStatus }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

    if (!productId || !ObjectId.isValid(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const db = await getDb();
    const productsCollection = db.collection("products");

    const result = await productsCollection.deleteOne({ 
      _id: new ObjectId(productId) 
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to delete product", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}