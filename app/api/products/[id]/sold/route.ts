import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const body = await req.json();
    const units = body.units as number;

    if (!productId || !ObjectId.isValid(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    if (!units || units <= 0) {
      return NextResponse.json(
        { error: "Invalid number of units" },
        { status: 400 }
      );
    }

    const db = await getDb();

    const product = await db
      .collection("products")
      .findOne({ _id: new ObjectId(productId) });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const currentStock = product.stock || 0;
    const currentSold = product.sold || 0;
    const currentIntake = product.totalIntake || product.price * currentStock;

    if (units > currentStock) {
      return NextResponse.json(
        { error: `Not enough stock. Available: ${currentStock}` },
        { status: 400 }
      );
    }

    const result = await db
      .collection("products")
      .updateOne(
        { _id: new ObjectId(productId) },
        {
          $set: {
            stock: currentStock - units,
            sold: currentSold + units,
            totalIntake: currentIntake,
          },
        }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Units marked as sold successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Failed to mark units sold", error);
    return NextResponse.json(
      { error: "Failed to mark units sold" },
      { status: 500 }
    );
  }
}
