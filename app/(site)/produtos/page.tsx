import Image from "next/image"
import Link from "next/link"
import { prisma } from "@/lib/prisma"

async function getData() {
  const [categorias, produtos] = await Promise.all([
    prisma.categorias.findMany({
      where: { ativo: 1 },
      orderBy: { ordem: "asc" },
    }),
    prisma.produtos.findMany({
      where: { ativo: 1 },
      orderBy: [{ ordem: "asc" }, { id: "asc" }],
    }),
  ])
  return { categorias, produtos }
}

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>
}) {
  const { categorias, produtos } = await getData()
  const { categoria: catAtiva = "" } = await searchParams
  const filtrados = catAtiva
    ? produtos.filter((p) => p.categoria_nome === catAtiva)
    : produtos

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Nossos Produtos</h1>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-10">
        <Link href="/produtos"
          className={`px-4 py-2 rounded-full text-sm border ${!catAtiva ? "bg-[var(--color-primary)] text-white border-transparent" : "border-[var(--color-border)] hover:border-[var(--color-primary)]"}`}>
          Todos
        </Link>
        {categorias.map((c) => (
          <Link key={c.id} href={`/produtos?categoria=${encodeURIComponent(c.nome)}`}
            className={`px-4 py-2 rounded-full text-sm border ${catAtiva === c.nome ? "bg-[var(--color-primary)] text-white border-transparent" : "border-[var(--color-border)] hover:border-[var(--color-primary)]"}`}>
            {c.nome}
          </Link>
        ))}
      </div>

      {/* Grid */}
      {filtrados.length === 0 ? (
        <p className="text-[var(--color-text-muted)] text-center py-20">Nenhum produto encontrado.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtrados.map((p) => (
            <div key={p.id} className="border border-[var(--color-border)] rounded-xl overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-square bg-[var(--color-surface-2)] relative">
                {p.imagem ? (
                  <Image src={`/${p.imagem}`} alt={p.nome} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">🛍️</div>
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-medium">{p.nome}</p>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{p.categoria_nome}</p>
                {p.descricao && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.descricao}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
