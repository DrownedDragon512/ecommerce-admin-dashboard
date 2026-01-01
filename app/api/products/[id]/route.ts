import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const url = new URL(req.url);
    const body = await req.clone().json().catch(() => undefined);
    const { id: paramId } = await params;

    const id = (paramId || body?.id || url.searchParams.get("id") || "").trim();

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const db = await getDb();

    const objectIdQuery = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : null;
    const stringIdQuery = { _id: id };

    const result = await db.collection("products").deleteOne({
      $or: objectIdQuery ? [objectIdQuery, stringIdQuery] : [stringIdQuery],
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
