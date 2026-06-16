import { Navbar } from "@/components/site/Navbar"
import { Footer } from "@/components/site/Footer"
import { prisma } from "@/lib/prisma"

async function getMenuItems() {
  try {
    return await prisma.menu_items.findMany({
      where: { tipo: "nav", ativo: 1 },
      orderBy: { ordem: "asc" },
    })
  } catch { return [] }
}

async function getWpp() {
  try {
    const row = await prisma.configuracoes.findFirst({ where: { chave: "whatsapp" } })
    return row?.valor ?? "5531995786466"
  } catch { return "5531995786466" }
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [items, wpp] = await Promise.all([getMenuItems(), getWpp()])

  return (
    <>
      <Navbar items={items.map(i => ({ id: i.id, label: i.label, url: i.url, target: i.target ?? "_self" }))} wpp={wpp} />
      <main>{children}</main>
      <Footer />
    </>
  )
}
