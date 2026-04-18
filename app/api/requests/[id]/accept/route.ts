import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!session.user.hasAccessibleSpot) {
    return NextResponse.json({ error: "Only accessible spot holders can accept swaps" }, { status: 403 });
  }

  const { id } = await params;

  const swapRequest = await prisma.swapRequest.findUnique({ where: { id } });
  if (!swapRequest) return NextResponse.json({ error: "Request not found" }, { status: 404 });
  if (swapRequest.status !== "OPEN") {
    return NextResponse.json({ error: "This request is no longer open" }, { status: 400 });
  }
  if (swapRequest.requesterId === session.user.id) {
    return NextResponse.json({ error: "Cannot accept your own request" }, { status: 400 });
  }

  const alreadyAccepted = await prisma.swapRequest.findFirst({
    where: {
      acceptorId: session.user.id,
      date: swapRequest.date,
      status: "ACCEPTED",
    },
  });

  if (alreadyAccepted) {
    return NextResponse.json({ error: "You have already accepted a swap for this date" }, { status: 400 });
  }

  const updated = await prisma.swapRequest.update({
    where: { id },
    data: { status: "ACCEPTED", acceptorId: session.user.id },
    include: {
      requester: { select: { name: true, unitNumber: true } },
      acceptor: { select: { name: true, unitNumber: true, spotIdentifier: true } },
    },
  });

  return NextResponse.json(updated);
}
