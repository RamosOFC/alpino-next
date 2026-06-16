import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(req: Request) {
  // NOTA: writeFile funciona apenas localmente.
  // Em produção (Vercel), migrar para Vercel Blob (@vercel/blob) — será feito na Task de deploy.
  const { error } = await requireAuth()
  if (error) return error

  try {
    const form = await req.formData()
    const file = form.get("file") as File
    const link = (form.get("link") as string) ?? ""

    if (!file) return NextResponse.json({ error: "Arquivo obrigatório" }, { status: 400 })

    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Tipo de arquivo inválido. Use JPG, PNG, WebP ou GIF." }, { status: 400 })
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Arquivo muito grande. Máximo 10 MB." }, { status: 400 })
    }

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
  } catch (e: unknown) {
    console.error(e)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
