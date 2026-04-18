import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminUsersClient from "./admin-users-client";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user.isAdmin) redirect("/dashboard");

  return (
    <AdminUsersClient
      currentUserId={session.user.id}
      userName={session.user.name}
    />
  );
}
