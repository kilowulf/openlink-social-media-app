import { PrismaClient } from "@prisma/client";

// Following code ensures that redundant or unnecessary instantiations of PrismaClient instances do not take place
const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV === "development") globalThis.prismaGlobal = prisma;
// development
// production
