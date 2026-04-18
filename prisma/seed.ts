import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminHash = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@parkswap.local" },
    update: {},
    create: {
      email: "admin@parkswap.local",
      name: "Admin",
      unitNumber: "000",
      passwordHash: adminHash,
      isAdmin: true,
      hasAccessibleSpot: false,
    },
  });

  console.log(`Admin created: ${admin.email} / password: admin123`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
