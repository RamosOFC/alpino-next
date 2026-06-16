import { Sidebar } from "@/components/admin/Sidebar"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <div className="flex min-h-screen bg-[var(--color-surface-2)]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-[var(--color-border)] px-6 h-14 flex items-center justify-between flex-shrink-0">
          <span className="text-sm text-[var(--color-text-muted)]">Bem-vindo, {session.user?.name}</span>
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
