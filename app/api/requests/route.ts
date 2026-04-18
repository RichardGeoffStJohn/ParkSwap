import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const requests = await prisma.swapRequest.findMany({
    where: {
      status: "OPEN",
      date: { gte: today },
    },
    include: {
      requester: { select: { name: true, unitNumber: true } },
    },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(requests);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.hasAccessibleSpot) {
    return NextResponse.json({ error: "Accessible spot holders cannot request swaps" }, { status: 403 });
  }

  const { date, reason } = await req.json();
  if (!date) return NextResponse.json({ error: "Date is required" }, { status: 400 });

  const requestDate = new Date(date);
  requestDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (requestDate < today) {
    return NextResponse.json({ error: "Cannot request a swap for a past date" }, { status: 400 });
  }

  const existing = await prisma.swapRequest.findFirst({
    where: {
      requesterId: session.user.id,
      date: requestDate,
      status: { in: ["OPEN", "ACCEPTED"] },
    },
  });

  if (existing) {
    return NextResponse.json({ error: "You already have a request for this date" }, { status: 400 });
  }

  const request = await prisma.swapRequest.create({
    data: {
      requesterId: session.user.id,
      date: requestDate,
      reason: reason || null,
    },
  });

  return NextResponse.json(request, { status: 201 });
}
