import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"
import { NextResponse } from "next/server"

export async function GET() {
  const banners = await prisma.banners.findMany({
    where: { ativo: 1 },
    orderBy: [{ ordem: "asc" }, { id: "asc" }],
  })
  return NextResponse.json(banners)
}

export async function POST(req: Request) {
  const { error } = await requireAuth()
  if (error) return error
  const body = await req.json()
  const banner = await prisma.banners.create({ data: body })
  return NextResponse.json(banner, { status: 201 })
}

export async function PUT(req: Request) {
  const { error } = await requireAuth()
  if (error) return error
  const body = await req.json()
  const { id, ...data } = body
  const banner = await prisma.banners.update({ where: { id }, data })
  return NextResponse.json(banner)
}

export async function DELETE(req: Request) {
  const { error } = await requireAuth()
  if (error) return error
  const { id } = await req.json()
  await prisma.banners.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
