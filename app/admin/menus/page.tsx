"use client"
import { useEffect, useState } from "react"

type MenuItem = { id: number; label: string; url: string; tipo: string | null; target: string | null; ordem: number | null; ativo: number | null }

export default function AdminMenus() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [form, setForm] = useState({ label: "", url: "", tipo: "nav", target: "_self", ativo: 1 })
  const [msg, setMsg] = useState("")

  useEffect(() => {
    Promise.all([
      fetch("/api/menus?tipo=nav").then(r => r.json()),
      fetch("/api/menus?tipo=footer").then(r => r.json()),
    ]).then(([nav, footer]) => setItems([...nav, ...footer]))
  }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch("/api/menus", {
      method: "POST",
      body: JSON.stringify({ ...form, ordem: items.filter(i => i.tipo === form.tipo).length + 1 }),
      headers: { "Content-Type": "application/json" },
    })
    if (res.ok) {
      const novo = await res.json()
      setItems(i => [...i, novo])
      setForm({ label: "", url: "", tipo: "nav", target: "_self", ativo: 1 })
      setMsg("Item adicionado!")
      setTimeout(() => setMsg(""), 3000)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Excluir este item?")) return
    await fetch("/api/menus", { method: "DELETE", body: JSON.stringify({ id }), headers: { "Content-Type": "application/json" } })
    setItems(i => i.filter(x => x.id !== id))
  }

  const navItems = items.filter(i => i.tipo === "nav")
  const footerItems = items.filter(i => i.tipo === "footer")

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Menus</h1>
      {msg && <div className="bg-green-50 text-green-700 px-4 py-2 rounded mb-4 text-sm">✓ {msg}</div>}

      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 self-start">
          <h2 className="font-semibold mb-4">Novo Item</h2>
          <form onSubmit={handleAdd} className="flex flex-col gap-3">
            <input placeholder="Label *" required value={form.label}
              onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
              className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm" />
            <input placeholder="URL *" required value={form.url}
              onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
              className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm" />
            <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
              className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm">
              <option value="nav">Navegação principal</option>
              <option value="footer">Rodapé</option>
            </select>
            <select value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))}
              className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm">
              <option value="_self">Mesma aba</option>
              <option value="_blank">Nova aba</option>
            </select>
            <button type="submit" className="bg-[var(--color-primary)] text-white rounded-lg py-2 text-sm font-medium hover:bg-[var(--color-primary-dark)]">
              Adicionar
            </button>
          </form>
        </div>

        <div className="flex flex-col gap-6">
          {[{ label: "Navegação Principal", items: navItems }, { label: "Rodapé", items: footerItems }].map(group => (
            <div key={group.label} className="bg-white rounded-xl border border-[var(--color-border)] p-6">
              <h2 className="font-semibold mb-4">{group.label}</h2>
              <div className="flex flex-col gap-2">
                {group.items.map(item => (
                  <div key={item.id} className="flex items-center gap-3 border border-[var(--color-border)] rounded-lg p-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-[var(--color-text-muted)] truncate">{item.url}</p>
                    </div>
                    <button onClick={() => handleDelete(item.id)} className="text-xs text-red-600 hover:underline flex-shrink-0">Excluir</button>
                  </div>
                ))}
                {!group.items.length && <p className="text-[var(--color-text-muted)] text-sm text-center py-4">Nenhum item.</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
