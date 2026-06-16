import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const todos = new URL(req.url).searchParams.get("todos") === "1"
  const depoimentos = await prisma.depoimentos.findMany({
    where: todos ? {} : { ativo: 1 },
    orderBy: [{ ordem: "asc" }, { id: "asc" }],
  })
  return NextResponse.json(depoimentos)
}

export async function POST(req: Request) {
  const { error } = await requireAuth()
  if (error) return error
  const body = await req.json()
  const max = await prisma.depoimentos.aggregate({ _max: { ordem: true } })
  const depoimento = await prisma.depoimentos.create({
    data: {
      ...body,
      ordem: body.ordem ?? (max._max.ordem ?? 0) + 1,
    },
  })
  return NextResponse.json(depoimento, { status: 201 })
}

export async function PUT(req: Request) {
  const { error } = await requireAuth()
  if (error) return error
  const body = await req.json()
  const { id, ...data } = body
  const depoimento = await prisma.depoimentos.update({ where: { id }, data })
  return NextResponse.json(depoimento)
}

export async function DELETE(req: Request) {
  const { error } = await requireAuth()
  if (error) return error
  const { id } = await req.json()
  await prisma.depoimentos.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
