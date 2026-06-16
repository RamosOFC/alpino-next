import { PrismaMariaDb } from "@prisma/adapter-mariadb"
import { PrismaClient } from "../app/generated/prisma/client"

declare global {
  // eslint-disable-next-line no-var
  var prismaClient: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL env var is not set")
  // PrismaMariaDb accepts a mariadb:// connection string; DATABASE_URL uses mysql://
  const mariadbUrl = url.replace(/^mysql:\/\//, "mariadb://")
  const adapter = new PrismaMariaDb(mariadbUrl)
  return new PrismaClient({ adapter })
}

export const prisma: PrismaClient =
  global.prismaClient ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  global.prismaClient = prisma
}
