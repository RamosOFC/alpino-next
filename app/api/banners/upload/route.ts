import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(req: Request) {
  const { error } = await requireAuth()
  if (error) return error

  const form = await req.formData()
  const file = form.get("file") as File
  const link = (form.get("link") as string) ?? ""

  if (!file) return NextResponse.json({ error: "Arquivo obrigatório" }, { status: 400 })

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const ext = path.extname(file.name).toLowerCase() || ".jpg"
  const filename = `banner_${Date.now()}${ext}`
  const uploadDir = path.join(process.cwd(), "public", "images", "slides")

  await mkdir(uploadDir, { recursive: true })
  await writeFile(path.join(uploadDir, filename), buffer)

  const max = await prisma.banners.aggregate({ _max: { ordem: true } })
  const banner = await prisma.banners.create({
    data: {
      imagem: `images/slides/${filename}`,
      link,
      ativo: 1,
      ordem: (max._max.ordem ?? 0) + 1,
    },
  })

  return NextResponse.json(banner, { status: 201 })
}
