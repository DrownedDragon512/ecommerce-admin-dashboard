import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { ProfileClient } from "./ProfileClient";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  return <ProfileClient initialName={user.name || "Admin"} email={user.email} userId={user.userId} />;
}
