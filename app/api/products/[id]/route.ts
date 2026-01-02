import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { z } from "zod";
import { uploadImage } from "@/lib/cloudinary";
import { getAuthUser } from "@/lib/auth";

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
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: paramId } = await params;

    if (!paramId || !ObjectId.isValid(paramId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const db = await getDb();

    const product = await db
      .collection("products")
      .findOne({ _id: new ObjectId(paramId), userId: user.userId });

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
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: paramId } = await params;
    const body = await req.json();

    if (!paramId || !ObjectId.isValid(paramId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const validatedData = productSchema.parse(body);

    let imageUrl = validatedData.image || "";
    if (imageUrl && imageUrl.startsWith("data:image")) {
      // Upload new image to Cloudinary
      imageUrl = await uploadImage(imageUrl);
    }

    const db = await getDb();

    const result = await db
      .collection("products")
      .updateOne(
        { _id: new ObjectId(paramId), userId: user.userId },
        {
          $set: {
            name: validatedData.name,
            description: validatedData.description,
            price: validatedData.price,
            stock: validatedData.stock,
            image: imageUrl,
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
    return NextResponse.json(
      { error: isValidationError ? "Invalid product data" : "Unexpected error" },
      { status: isValidationError ? 400 : 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: paramId } = await params;

    if (!paramId || !ObjectId.isValid(paramId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const db = await getDb();

    const result = await db
      .collection("products")
      .deleteOne({ _id: new ObjectId(paramId), userId: user.userId });

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
