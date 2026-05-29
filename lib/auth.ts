import jwt, { JwtPayload } from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

export interface AuthUser extends JwtPayload {
  userId: string;
  email: string;
  name?: string;
}

/**
 * Retrieves and verifies the authenticated user from the request cookies.
 * Returns the decoded user payload if valid, or null if the token is missing or invalid.
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch (error) {
    // Catch invalid/expired tokens and return null to indicate no authenticated user
    console.warn("JWT Verification failed: Invalid or expired token.");
    return null;
  }
}