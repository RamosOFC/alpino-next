import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"
import { NextResponse } from "next/server"

const ALLOWED = ["banners", "produtos", "depoimentos", "marcas", "menu_items", "categorias", "subcategorias"] as const
type Tabela = typeof ALLOWED[number]

export async function POST(req: Request) {
  const { error } = await requireAuth()
  if (error) return error
  try {
    const { tabela, ids }: { tabela: string; ids: number[] } = await req.json()
    if (!ALLOWED.includes(tabela as Tabela)) {
      return NextResponse.json({ error: "Tabela inválida" }, { status: 400 })
    }
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "ids deve ser um array não vazio" }, { status: 400 })
    }
    await Promise.all(
      ids.map((id, i) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (prisma[tabela as Tabela] as any).update({ where: { id: Number(id) }, data: { ordem: i + 1 } })
      )
    )
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    console.error(e)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
