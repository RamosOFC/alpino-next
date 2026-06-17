import { PrismaMariaDb } from "@prisma/adapter-mariadb"
import { PrismaClient } from "../app/generated/prisma/client"

declare global {
  // eslint-disable-next-line no-var
  var prismaClient: PrismaClient | undefined
}

function createClient(): PrismaClient {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL env var is not set")
  const adapter = new PrismaMariaDb(url.replace(/^mysql:\/\//, "mariadb://"))
  return new PrismaClient({ adapter })
}

function getClient(): PrismaClient {
  if (!global.prismaClient) {
    global.prismaClient = createClient()
  }
  return global.prismaClient
}

// Proxy lazy: não instancia o cliente até a primeira chamada real
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return getClient()[prop as keyof PrismaClient]
  },
})
