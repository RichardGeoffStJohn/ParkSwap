import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await auth();
  if (!session?.user.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      unitNumber: true,
      hasAccessibleSpot: true,
      spotIdentifier: true,
      isAdmin: true,
      createdAt: true,
    },
    orderBy: { unitNumber: "asc" },
  });

  return NextResponse.json(users);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { email, name, unitNumber, password, hasAccessibleSpot, spotIdentifier } = await req.json();

  if (!email || !name || !unitNumber || !password) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 400 });

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      unitNumber,
      passwordHash,
      hasAccessibleSpot: hasAccessibleSpot ?? false,
      spotIdentifier: hasAccessibleSpot ? spotIdentifier : null,
    },
    select: {
      id: true,
      email: true,
      name: true,
      unitNumber: true,
      hasAccessibleSpot: true,
      spotIdentifier: true,
      isAdmin: true,
      createdAt: true,
    },
  });

  return NextResponse.json(user, { status: 201 });
}
