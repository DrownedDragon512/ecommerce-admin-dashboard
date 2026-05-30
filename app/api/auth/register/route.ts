import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/mongodb";

const USERS_COLLECTION = "users";
const SALT_ROUNDS = 10;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    // Strict input validation boundary
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const usersCollection = db.collection(USERS_COLLECTION);

    // Prevent duplicate entries
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Cryptographic hashing and document preparation
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const newUserDocument = {
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUserDocument);

    return NextResponse.json(
      { message: "User registered successfully", userId: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Registration API Error]:", error);
    return NextResponse.json(
      { error: "An error occurred during the registration process" },
      { status: 500 }
    );
  }
}