import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client Singleton:
 *
 * This code ensures that only a single instance of the PrismaClient is created and used throughout the application,
 * particularly in development environments where Hot Module Replacement (HMR) may lead to multiple instantiations.
 * This helps prevent unnecessary connections to the database and ensures efficient database operations.
 */

// Function that creates a new instance of PrismaClient
const prismaClientSingleton = () => {
  return new PrismaClient();
};

// Declaring a global variable that can hold the PrismaClient instance
declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

/**
 * The `prisma` constant holds the PrismaClient instance.
 * If `prismaGlobal` is already defined, it will reuse that instance; otherwise, it creates a new one.
 * This ensures that PrismaClient isn't reinstantiated unnecessarily.
 */
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

/**
 * In development mode, the PrismaClient instance is stored in `globalThis.prismaGlobal`,
 * so it persists across HMR (Hot Module Reloading) events. This prevents multiple instances from being created.
 * In production, HMR is not used, so this step is not necessary.
 */
if (process.env.NODE_ENV === "development") globalThis.prismaGlobal = prisma;
