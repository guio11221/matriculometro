import { PrismaClient } from "@/app/generated/prisma";

const globalForPrisma = globalThis;

// Reutiliza a instância em dev (hot-reload), mas cria uma nova em produção
const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
