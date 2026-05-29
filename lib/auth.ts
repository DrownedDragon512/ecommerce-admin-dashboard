import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this";

export async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) {
    return null;
  }

  //the try command is used to catch any errors that may occur during the verification process. If the token is valid, it will return the decoded user information. If the token is invalid or expired, it will catch the error and return null, indicating that there is no authenticated user.
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      name?: string;
    };
    return decoded;
  } catch (error) {
    return null;
  }
}
