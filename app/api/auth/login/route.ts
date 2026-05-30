import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

// Added strict typing for the request payload
interface LoginRequest {
  email?: string;
  password?: string;
}

const ADMIN_CREDENTIALS = [
  { email: "admin@xyz.com", password: "passforadmin", userId: "user_1" },
  { email: "admin2@xyz.com", password: "passforadmin", userId: "user_2" },
];

export async function POST(req: Request) {
  try {
    const body: LoginRequest = await req.json();
    const trimmedEmail = body.email?.trim().toLowerCase();
    const trimmedPassword = body.password?.trim();

    if (!trimmedEmail || !trimmedPassword) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    console.log(`[Auth] Initiating login sequence for: ${trimmedEmail}`);

    // Verify credentials against admin store
    const authenticatedAdmin = ADMIN_CREDENTIALS.find(
      (admin) => admin.email.toLowerCase() === trimmedEmail && admin.password === trimmedPassword
    );

    if (!authenticatedAdmin) {
      console.warn(`[Auth] Authentication rejected for: ${trimmedEmail}`);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Construct token payload payload
    const tokenPayload = {
      email: authenticatedAdmin.email,
      name: "Admin",
      userId: authenticatedAdmin.userId,
    };

    const authToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "7d" });

    const response = NextResponse.json(
      { 
        message: "Login successful", 
        success: true,
        user: { email: authenticatedAdmin.email, name: "Admin" } 
      },
      { status: 200 }
    );

    // Apply security policies to session cookie
    response.cookies.set("auth-token", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Dynamic security enforcement
      sameSite: "lax",
      path: "/",
      maxAge: 604800, // 7 days converted to raw seconds
    });

    console.log(`[Auth] Session successfully established for: ${trimmedEmail}`);
    return response;

  } catch (error) {
    console.error("[Auth] Fatal error during authentication pipeline:", error);
    return NextResponse.json(
      { error: "An internal server error occurred during authentication" },
      { status: 500 }
    );
  }
}