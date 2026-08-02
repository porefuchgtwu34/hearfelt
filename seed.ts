// Seed script for Heartfelt
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Heartfelt database...");

  // Create admin
  const adminHash = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@hearfelt.app" },
    update: {},
    create: {
      username: "admin",
      email: "admin@hearfelt.app",
      passwordHash: adminHash,
      role: "ADMIN",
      bio: "Platform administrator",
      avatarColor: "rose",
    },
  });

  // Create sample users
  const lunaHash = await bcrypt.hash("password123", 10);
  const luna = await prisma.user.upsert({
    where: { email: "luna@example.com" },
    update: {},
    create: {
      username: "luna_writes",
      email: "luna@example.com",
      passwordHash: lunaHash,
      role: "USER",
      bio: "Writing about love and self-discovery",
      avatarColor: "violet",
    },
  });

  console.log("Seeded users:", { admin: admin.username, luna: luna.username });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
