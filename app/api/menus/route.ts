import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const tipo = new URL(req.url).searchParams.get("tipo") ?? "nav"
  if (!["nav", "footer"].includes(tipo)) {
    return NextResponse.json({ error: "tipo inválido" }, { status: 400 })
  }
  const items = await prisma.menu_items.findMany({
    where: { tipo: tipo as "nav" | "footer", ativo: 1 },
    orderBy: { ordem: "asc" },
  })
  return NextResponse.json(items)
}

export async function POST(req: Request) {
  const { error } = await requireAuth()
  if (error) return error
  try {
    const body = await req.json()
    const item = await prisma.menu_items.create({ data: body })
    return NextResponse.json(item, { status: 201 })
  } catch (e: unknown) {
    console.error(e)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  const { error } = await requireAuth()
  if (error) return error
  try {
    const body = await req.json()
    const { id, ...data } = body
    const item = await prisma.menu_items.update({ where: { id }, data })
    return NextResponse.json(item)
  } catch (e: unknown) {
    console.error(e)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const { error } = await requireAuth()
  if (error) return error
  try {
    const { id } = await req.json()
    await prisma.menu_items.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    console.error(e)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
