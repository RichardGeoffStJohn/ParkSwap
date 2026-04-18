import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const swapRequest = await prisma.swapRequest.findUnique({ where: { id } });
  if (!swapRequest) return NextResponse.json({ error: "Request not found" }, { status: 404 });
  if (swapRequest.requesterId !== session.user.id) {
    return NextResponse.json({ error: "Not your request" }, { status: 403 });
  }
  if (swapRequest.status === "CANCELLED") {
    return NextResponse.json({ error: "Already cancelled" }, { status: 400 });
  }

  const updated = await prisma.swapRequest.update({
    where: { id },
    data: { status: "CANCELLED" },
  });

  return NextResponse.json(updated);
}
