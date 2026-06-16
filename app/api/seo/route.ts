import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"
import { NextResponse } from "next/server"

export async function GET() {
  const rows = await prisma.seo_paginas.findMany()
  return NextResponse.json(rows)
}

export async function PUT(req: Request) {
  const { error } = await requireAuth()
  if (error) return error
  try {
    const body = await req.json()
    await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body.map((row: any) => {
        const { pagina, ...campos } = row
        return prisma.seo_paginas.upsert({
          where: { pagina },
          update: campos,
          create: row,
        })
      })
    )
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    console.error(e)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
