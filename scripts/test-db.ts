/**
 * Test script — run with: npx tsx scripts/test-db.ts
 * Loads .env before initialising Prisma so DATABASE_URL is available.
 */
import { config } from "dotenv"
config() // must run before lib/prisma is imported

// Dynamic import ensures dotenv has already run before the module is evaluated
async function main() {
  const { prisma } = await import("../lib/prisma")
  const count = await prisma.produtos.count()
  console.log("Produtos no banco:", count)
  await prisma.$disconnect()
}

main().catch(console.error)
