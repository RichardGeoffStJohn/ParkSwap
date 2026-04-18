import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/");

  return (
    <DashboardClient
      userId={session.user.id}
      userName={session.user.name}
      hasAccessibleSpot={session.user.hasAccessibleSpot}
      spotIdentifier={session.user.spotIdentifier}
      isAdmin={session.user.isAdmin}
    />
  );
}
