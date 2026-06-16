import { Carousel } from "@/components/site/Carousel"
import { MarcasMarquee } from "@/components/site/MarcasMarquee"
import { prisma } from "@/lib/prisma"
import Image from "next/image"
import Link from "next/link"

async function getData() {
  const [banners, cfg, marcas, depoimentos, produtos] = await Promise.all([
    prisma.banners.findMany({ where: { ativo: 1 }, orderBy: [{ ordem: "asc" }, { id: "asc" }] }),
    prisma.configuracoes.findMany().then(rows => {
      const c: Record<string, string> = {}
      for (const r of rows) c[r.chave] = r.valor ?? ""
      return c
    }),
    prisma.marcas.findMany({ where: { ativo: 1 }, orderBy: { ordem: "asc" } }),
    prisma.depoimentos.findMany({ where: { ativo: 1 }, orderBy: { ordem: "asc" } }),
    prisma.produtos.findMany({ where: { destaque: 1, ativo: 1 }, orderBy: [{ ordem: "asc" }, { id: "asc" }] }),
  ])
  return { banners, cfg, marcas, depoimentos, produtos }
}

export default async function Home() {
  const { banners, cfg, marcas, depoimentos, produtos } = await getData()
  const wpp = cfg.whatsapp ?? "5531995786466"
  const lojaUrl = cfg.loja_url ?? "https://loja.alpinolinhas.com.br/"

  return (
    <>
      <Carousel banners={banners as any} />

      {/* Slogan */}
      <section className="py-10 bg-[var(--color-surface-2)] text-center">
        <p className="text-lg text-gray-600 italic max-w-2xl mx-auto px-4">
          &ldquo;{cfg.slogan ?? "Tudo em aviamentos para a sua criação"}&rdquo;
        </p>
      </section>

      {/* Produtos em destaque */}
      {produtos.length > 0 && (
        <section className="py-16 max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Conheça nossos produtos:</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {produtos.map((p) => (
              <Link href="/produtos" key={p.id}
                className="border border-[var(--color-border)] rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-square bg-[var(--color-surface-2)] relative">
                  {p.imagem ? (
                    <Image src={`/${p.imagem}`} alt={p.nome} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">🛍️</div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium truncate">{p.nome}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{p.categoria_nome}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* História */}
      <section id="historia" className="py-16 bg-[var(--color-surface-2)]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <span className="inline-block bg-blue-50 text-blue-600 text-sm font-medium px-3 py-1 rounded-full mb-4">
            {cfg.historia_badge ?? "Desde 1982"}
          </span>
          <h2 className="text-3xl font-bold mb-6">{cfg.historia_titulo ?? "Alpino Linhas"}</h2>
          {cfg.historia_texto1 && <p className="text-gray-600 leading-relaxed mb-4">{cfg.historia_texto1}</p>}
          {cfg.historia_texto2 && <p className="text-gray-600 leading-relaxed">{cfg.historia_texto2}</p>}
        </div>
      </section>

      {/* Marcas */}
      <MarcasMarquee marcas={marcas as any} />

      {/* Depoimentos */}
      {depoimentos.length > 0 && (
        <section className="py-16 bg-[var(--color-surface-2)]">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-10">O que nossos clientes dizem</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {depoimentos.map((d) => (
                <div key={d.id} className="bg-white rounded-xl p-6 shadow-sm border border-[var(--color-border)]">
                  <div className="text-yellow-400 mb-3">★★★★★</div>
                  <p className="text-gray-600 text-sm mb-4">&ldquo;{d.texto}&rdquo;</p>
                  <p className="font-semibold text-sm">{d.nome}{d.cargo ? ` · ${d.cargo}` : ""}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section id="contato" className="py-20 bg-[var(--color-primary)] text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Encontre o que você precisa</h2>
          <p className="mb-8 opacity-90">Navegue pelo nosso catálogo ou fale direto com a gente.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/produtos"
              className="bg-white text-[var(--color-primary)] px-6 py-3 rounded-lg font-medium hover:bg-gray-100">
              Ver Catálogo
            </Link>
            <a href={lojaUrl} target="_blank" rel="noopener noreferrer"
              className="border-2 border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10">
              Loja Online
            </a>
            <a href={`https://wa.me/${wpp}`} target="_blank" rel="noopener noreferrer"
              className="bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600">
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
