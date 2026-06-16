"use client"
import { useEffect, useState } from "react"

type Dep = { id: number; nome: string; cargo: string | null; texto: string; ativo: number | null }

export default function AdminDepoimentos() {
  const [deps, setDeps] = useState<Dep[]>([])
  const [form, setForm] = useState({ nome: "", cargo: "", texto: "", ativo: 1 })
  const [msg, setMsg] = useState("")

  useEffect(() => {
    fetch("/api/depoimentos?todos=1").then(r => r.json()).then(setDeps)
  }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch("/api/depoimentos", {
      method: "POST",
      body: JSON.stringify(form),
      headers: { "Content-Type": "application/json" },
    })
    if (res.ok) {
      const novo = await res.json()
      setDeps(d => [...d, novo])
      setForm({ nome: "", cargo: "", texto: "", ativo: 1 })
      setMsg("Depoimento adicionado!")
      setTimeout(() => setMsg(""), 3000)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Excluir este depoimento?")) return
    await fetch("/api/depoimentos", { method: "DELETE", body: JSON.stringify({ id }), headers: { "Content-Type": "application/json" } })
    setDeps(d => d.filter(x => x.id !== id))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Depoimentos</h1>
      {msg && <div className="bg-green-50 text-green-700 px-4 py-2 rounded mb-4 text-sm">✓ {msg}</div>}

      <div className="grid lg:grid-cols-[360px_1fr] gap-6">
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 self-start">
          <h2 className="font-semibold mb-4">Novo Depoimento</h2>
          <form onSubmit={handleAdd} className="flex flex-col gap-3">
            <input placeholder="Nome *" required value={form.nome}
              onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
              className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm" />
            <input placeholder="Cargo / Empresa" value={form.cargo}
              onChange={e => setForm(f => ({ ...f, cargo: e.target.value }))}
              className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm" />
            <textarea placeholder="Depoimento *" required rows={4} value={form.texto}
              onChange={e => setForm(f => ({ ...f, texto: e.target.value }))}
              className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm resize-none" />
            <button type="submit" className="bg-[var(--color-primary)] text-white rounded-lg py-2 text-sm font-medium hover:bg-[var(--color-primary-dark)]">
              Adicionar
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
          <h2 className="font-semibold mb-4">Depoimentos ({deps.length})</h2>
          <div className="flex flex-col gap-3">
            {deps.map(d => (
              <div key={d.id} className="border border-[var(--color-border)] rounded-lg p-4 flex justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{d.nome}{d.cargo ? <span className="text-[var(--color-text-muted)] font-normal"> · {d.cargo}</span> : null}</p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">&ldquo;{d.texto}&rdquo;</p>
                </div>
                <button onClick={() => handleDelete(d.id)} className="text-xs text-red-600 hover:underline flex-shrink-0">Excluir</button>
              </div>
            ))}
            {!deps.length && <p className="text-[var(--color-text-muted)] text-sm text-center py-8">Nenhum depoimento.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
