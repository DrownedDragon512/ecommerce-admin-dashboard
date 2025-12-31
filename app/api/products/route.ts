import { z } from "zod";
import { NextResponse } from "next/server";

/* --------- Zod schema (server-side) --------- */
const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  stock: z.number().int().nonnegative(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const validatedData = productSchema.parse(body);

    // For now, just log it
    console.log("Received product:", validatedData);

    return NextResponse.json(
      { message: "Product created successfully" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid product data" },
      { status: 400 }
    );
  }
}
