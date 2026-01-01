import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";
const ADMIN_CREDENTIALS = [
  { email: "admin@xyz.com", password: "passforadmin" },
  { email: "admin2@xyz.com", password: "passforadmin" },
];

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const trimmedEmail = email?.trim().toLowerCase();
    const trimmedPassword = password?.trim();

    if (!trimmedEmail || !trimmedPassword) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    console.log("Login attempt for email:", trimmedEmail);

    // Check against hardcoded admin credentials
    const validAdmin = ADMIN_CREDENTIALS.find(
      (admin) => admin.email.toLowerCase() === trimmedEmail && admin.password === trimmedPassword
    );

    if (!validAdmin) {
      console.log("Invalid credentials for email:", trimmedEmail);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { email: email, name: "Admin" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json(
      { message: "Login successful", user: { email: email, name: "Admin" }, success: true },
      { status: 200 }
    );

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: false, // Set to false for localhost
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    console.log("Login successful for:", email);
    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 }
    );
  }
}
