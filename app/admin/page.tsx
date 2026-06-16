import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function AdminDashboard() {
  const [totalProdutos, totalBanners, totalDepoimentos] = await Promise.all([
    prisma.produtos.count({ where: { ativo: 1 } }),
    prisma.banners.count({ where: { ativo: 1 } }),
    prisma.depoimentos.count({ where: { ativo: 1 } }),
  ])

  const cards = [
    { label: "Produtos ativos", value: totalProdutos, href: "/admin/produtos" },
    { label: "Banners ativos", value: totalBanners, href: "/admin/banners" },
    { label: "Depoimentos", value: totalDepoimentos, href: "/admin/depoimentos" },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {cards.map((c) => (
          <Link key={c.label} href={c.href}
            className="bg-white rounded-xl border border-[var(--color-border)] p-6 hover:shadow-md transition-shadow">
            <p className="text-3xl font-bold text-[var(--color-primary)] mb-1">{c.value}</p>
            <p className="text-sm text-[var(--color-text-muted)]">{c.label}</p>
          </Link>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
        <h2 className="font-semibold mb-4">Acesso Rápido</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Banners", href: "/admin/banners" },
            { label: "Produtos", href: "/admin/produtos" },
            { label: "Depoimentos", href: "/admin/depoimentos" },
            { label: "Configurações", href: "/admin/config" },
          ].map((a) => (
            <Link key={a.label} href={a.href}
              className="text-center bg-[var(--color-surface-2)] hover:bg-blue-50 text-sm px-4 py-3 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-colors">
              {a.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
