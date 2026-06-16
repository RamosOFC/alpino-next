import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const categoria = url.searchParams.get("categoria")
  const destaque = url.searchParams.get("destaque")
  const todos = url.searchParams.get("todos") === "1"

  const produtos = await prisma.produtos.findMany({
    where: {
      ...(todos ? {} : { ativo: 1 }),
      ...(categoria ? { categoria_nome: categoria } : {}),
      ...(destaque === "1" ? { destaque: 1 } : {}),
    },
    orderBy: [{ ordem: "asc" }, { id: "asc" }],
  })
  return NextResponse.json(produtos)
}

export async function POST(req: Request) {
  const { error } = await requireAuth()
  if (error) return error
  const body = await req.json()
  const produto = await prisma.produtos.create({ data: body })
  return NextResponse.json(produto, { status: 201 })
}

export async function PUT(req: Request) {
  const { error } = await requireAuth()
  if (error) return error
  const body = await req.json()
  const { id, ...data } = body
  const produto = await prisma.produtos.update({ where: { id }, data })
  return NextResponse.json(produto)
}

export async function DELETE(req: Request) {
  const { error } = await requireAuth()
  if (error) return error
  const { id } = await req.json()
  await prisma.produtos.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
