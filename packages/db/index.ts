import { PrismaClient } from "@prisma/client";

const prisma = (globalThis as any).prismaGlobal ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  (globalThis as any).prismaGlobal = prisma;
}

export default prisma;
