import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminSwapsClient from "./admin-swaps-client";

export default async function AdminSwapsPage() {
  const session = await auth();
  if (!session?.user.isAdmin) redirect("/dashboard");

  return <AdminSwapsClient userName={session.user.name} />;
}
