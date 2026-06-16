import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(req: Request) {
  const { error } = await requireAuth()
  if (error) return error

  try {
    const form = await req.formData()
    const file = form.get("file") as File
    const nome = (form.get("nome") as string) ?? ""
    const link = (form.get("link") as string) ?? ""

    if (!file) return NextResponse.json({ error: "Arquivo obrigatório" }, { status: 400 })

    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!ALLOWED_TYPES.includes(file.type))
      return NextResponse.json({ error: "Tipo inválido. Use JPG, PNG, WebP ou GIF." }, { status: 400 })
    if (file.size > 5 * 1024 * 1024)
      return NextResponse.json({ error: "Arquivo muito grande (max 5 MB)" }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const ext = path.extname(file.name).toLowerCase() || ".png"
    const filename = `marca_${Date.now()}${ext}`
    const uploadDir = path.join(process.cwd(), "public", "images", "marcas")
    await mkdir(uploadDir, { recursive: true })
    await writeFile(path.join(uploadDir, filename), Buffer.from(bytes))

    const max = await prisma.marcas.aggregate({ _max: { ordem: true } })
    const marca = await prisma.marcas.create({
      data: { nome, imagem: `images/marcas/${filename}`, link: link || null, ativo: 1, ordem: (max._max.ordem ?? 0) + 1 },
    })

    return NextResponse.json(marca, { status: 201 })
  } catch (e: unknown) {
    console.error(e)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
