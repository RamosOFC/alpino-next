import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"
import { NextResponse } from "next/server"

export async function GET() {
  const rows = await prisma.configuracoes.findMany()
  const cfg: Record<string, string> = {}
  for (const row of rows) cfg[row.chave] = row.valor ?? ""
  return NextResponse.json(cfg)
}

export async function PUT(req: Request) {
  const { error } = await requireAuth()
  if (error) return error
  try {
    const body: Record<string, string> = await req.json()
    await Promise.all(
      Object.entries(body).map(([chave, valor]) =>
        prisma.configuracoes.upsert({
          where: { chave },
          update: { valor },
          create: { chave, valor },
        })
      )
    )
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    console.error(e)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
