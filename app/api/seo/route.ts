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
  const body = await req.json()
  await Promise.all(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body.map((row: any) =>
      prisma.seo_paginas.upsert({
        where: { pagina: row.pagina },
        update: row,
        create: row,
      })
    )
  )
  return NextResponse.json({ ok: true })
}
