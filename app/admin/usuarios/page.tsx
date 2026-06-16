import { prisma } from "@/lib/prisma"

export default async function AdminUsuarios() {
  const usuarios = await prisma.admin_usuarios.findMany({ orderBy: { id: "asc" } })

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Usuários</h1>
      <div className="bg-white rounded-xl border border-[var(--color-border)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-surface-2)] text-[var(--color-text-muted)]">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Usuário</th>
                <th className="px-4 py-3 text-left">Criado em</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id} className="border-t border-[var(--color-border)]">
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">{u.id}</td>
                  <td className="px-4 py-3 font-medium">{u.usuario}</td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">
                    {u.criado_em ? new Date(u.criado_em).toLocaleDateString("pt-BR") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-[var(--color-text-muted)] text-center p-4">
          Para criar/alterar usuários, acesse o banco diretamente via phpMyAdmin.
        </p>
      </div>
    </div>
  )
}
