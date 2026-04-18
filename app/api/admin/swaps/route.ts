import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const swaps = await prisma.swapRequest.findMany({
    include: {
      requester: { select: { name: true, unitNumber: true } },
      acceptor: { select: { name: true, unitNumber: true, spotIdentifier: true } },
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(swaps);
}
