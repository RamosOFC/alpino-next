import Image from "next/image"

type Marca = { id: number; imagem: string; nome: string; link: string | null }

export function MarcasMarquee({ marcas }: { marcas: Marca[] }) {
  if (!marcas.length) return null
  const doubled = [...marcas, ...marcas]
  return (
    <section className="py-12 overflow-hidden">
      <h2 className="text-2xl font-bold text-center mb-8">Marcas que Trabalhamos</h2>
      <div className="flex gap-8" style={{ animation: "marquee 30s linear infinite" }}>
        {doubled.map((m, i) => (
          <div key={i} className="flex-shrink-0 w-32 h-16 relative grayscale hover:grayscale-0 transition-all">
            <Image src={`/${m.imagem}`} alt={m.nome} fill className="object-contain" />
          </div>
        ))}
      </div>
    </section>
  )
}
