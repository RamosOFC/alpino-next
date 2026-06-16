"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"

const navItems = [
  { label: "Dashboard", href: "/admin", icon: "⊞", section: "Principal" },
  { label: "Banners", href: "/admin/banners", icon: "🖼", section: "Conteúdo" },
  { label: "História & Slogan", href: "/admin/historia", icon: "✏️", section: "Conteúdo" },
  { label: "Depoimentos", href: "/admin/depoimentos", icon: "💬", section: "Conteúdo" },
  { label: "Marcas Parceiras", href: "/admin/marcas", icon: "🏅", section: "Conteúdo" },
  { label: "Categorias", href: "/admin/categorias", icon: "≡", section: "Conteúdo" },
  { label: "Produtos", href: "/admin/produtos", icon: "📦", section: "Conteúdo" },
  { label: "Menus", href: "/admin/menus", icon: "☰", section: "Site" },
  { label: "SEO", href: "/admin/seo", icon: "🔍", section: "Site" },
  { label: "Configurações", href: "/admin/config", icon: "⚙️", section: "Site" },
  { label: "Usuários", href: "/admin/usuarios", icon: "👥", section: "Site" },
]

const sections = ["Principal", "Conteúdo", "Site"]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 min-h-screen bg-gray-900 text-gray-300 flex flex-col flex-shrink-0">
      <div className="p-5 border-b border-gray-700">
        <p className="text-white font-semibold text-sm">Alpino Linhas</p>
        <p className="text-gray-400 text-xs mt-0.5">Painel Admin</p>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        {sections.map((section) => (
          <div key={section} className="mb-2">
            <p className="px-5 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">{section}</p>
            {navItems
              .filter((i) => i.section === section)
              .map((item) => {
                const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
                return (
                  <Link key={item.href} href={item.href}
                    className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${isActive ? "bg-[var(--color-primary)] text-white" : "hover:bg-gray-800 hover:text-white"}`}>
                    <span>{item.icon}</span>
                    {item.label}
                  </Link>
                )
              })}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700 flex flex-col gap-2">
        <Link href="/" target="_blank" className="text-xs text-gray-400 hover:text-white text-center">↗ Ver Site</Link>
        <button onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-xs text-gray-400 hover:text-red-400 text-center">
          Sair
        </button>
      </div>
    </aside>
  )
}
