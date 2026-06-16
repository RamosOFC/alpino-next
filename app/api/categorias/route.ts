import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"
import { NextResponse } from "next/server"

export async function GET() {
  const categorias = await prisma.categorias.findMany({
    where: { ativo: 1 },
    orderBy: { ordem: "asc" },
    include: {
      subcategorias: {
        where: { ativo: 1 },
        orderBy: { ordem: "asc" },
      },
    },
  })
  return NextResponse.json(categorias)
}

export async function POST(req: Request) {
  const { error } = await requireAuth()
  if (error) return error
  const body = await req.json()
  const categoria = await prisma.categorias.create({ data: body })
  return NextResponse.json(categoria, { status: 201 })
}

export async function PUT(req: Request) {
  const { error } = await requireAuth()
  if (error) return error
  const body = await req.json()
  const { id, ...data } = body
  const categoria = await prisma.categorias.update({ where: { id }, data })
  return NextResponse.json(categoria)
}

export async function DELETE(req: Request) {
  const { error } = await requireAuth()
  if (error) return error
  const { id } = await req.json()
  await prisma.categorias.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
