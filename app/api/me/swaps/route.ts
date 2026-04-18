import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const swaps = await prisma.swapRequest.findMany({
    where: {
      OR: [
        { requesterId: session.user.id },
        { acceptorId: session.user.id },
      ],
      date: { gte: today },
      status: { not: "CANCELLED" },
    },
    include: {
      requester: { select: { name: true, unitNumber: true } },
      acceptor: { select: { name: true, unitNumber: true, spotIdentifier: true } },
    },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(swaps);
}
