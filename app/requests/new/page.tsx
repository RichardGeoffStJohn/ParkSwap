import { auth } from "@/auth";
import { redirect } from "next/navigation";
import NewRequestClient from "./new-request-client";

export default async function NewRequestPage() {
  const session = await auth();
  if (!session) redirect("/");
  if (session.user.hasAccessibleSpot) redirect("/dashboard");

  return (
    <NewRequestClient
      userName={session.user.name}
      isAdmin={session.user.isAdmin}
      hasAccessibleSpot={false}
    />
  );
}
