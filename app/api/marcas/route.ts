import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"
import { NextResponse } from "next/server"

export async function GET() {
  const marcas = await prisma.marcas.findMany({
    where: { ativo: 1 },
    orderBy: [{ ordem: "asc" }, { id: "asc" }],
  })
  return NextResponse.json(marcas)
}

export async function POST(req: Request) {
  const { error } = await requireAuth()
  if (error) return error
  const body = await req.json()
  const marca = await prisma.marcas.create({ data: body })
  return NextResponse.json(marca, { status: 201 })
}

export async function PUT(req: Request) {
  const { error } = await requireAuth()
  if (error) return error
  const body = await req.json()
  const { id, ...data } = body
  const marca = await prisma.marcas.update({ where: { id }, data })
  return NextResponse.json(marca)
}

export async function DELETE(req: Request) {
  const { error } = await requireAuth()
  if (error) return error
  const { id } = await req.json()
  await prisma.marcas.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
