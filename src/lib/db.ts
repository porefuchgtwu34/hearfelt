import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient() {
  if (!process.env.DATABASE_URL) {
    // Lazy placeholder — real queries will fail until DATABASE_URL is set
    return new PrismaClient({
      datasources: {
        db: { url: "postgresql://localhost:5432/heartfelt_placeholder" },
      },
      log: [],
    });
  }
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  });
}

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
