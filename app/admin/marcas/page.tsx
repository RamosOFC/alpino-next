"use client"
import { useEffect, useState } from "react"
import Image from "next/image"

type Marca = { id: number; nome: string; imagem: string; link: string | null; ativo: number | null }

export default function AdminMarcas() {
  const [marcas, setMarcas] = useState<Marca[]>([])
  const [form, setForm] = useState({ nome: "", link: "" })
  const [file, setFile] = useState<File | null>(null)
  const [msg, setMsg] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch("/api/marcas").then(r => r.json()).then(setMarcas)
  }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    setLoading(true)
    const fd = new FormData()
    fd.append("file", file)
    fd.append("nome", form.nome)
    fd.append("link", form.link)
    const res = await fetch("/api/marcas/upload", { method: "POST", body: fd })
    setLoading(false)
    if (res.ok) {
      const nova = await res.json()
      setMarcas(m => [...m, nova])
      setForm({ nome: "", link: "" })
      setFile(null)
      setMsg("Marca adicionada!")
      setTimeout(() => setMsg(""), 3000)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Excluir esta marca?")) return
    await fetch("/api/marcas", { method: "DELETE", body: JSON.stringify({ id }), headers: { "Content-Type": "application/json" } })
    setMarcas(m => m.filter(x => x.id !== id))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Marcas Parceiras</h1>
      {msg && <div className="bg-green-50 text-green-700 px-4 py-2 rounded mb-4 text-sm">✓ {msg}</div>}

      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 self-start">
          <h2 className="font-semibold mb-4">Nova Marca</h2>
          <form onSubmit={handleAdd} className="flex flex-col gap-3">
            <input placeholder="Nome da marca *" required value={form.nome}
              onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
              className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm" />
            <input type="file" accept="image/*" required
              onChange={e => setFile(e.target.files?.[0] ?? null)}
              className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm" />
            <input type="url" placeholder="Site (opcional)" value={form.link}
              onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
              className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm" />
            <button type="submit" disabled={loading}
              className="bg-[var(--color-primary)] text-white rounded-lg py-2 text-sm font-medium hover:bg-[var(--color-primary-dark)] disabled:opacity-50">
              {loading ? "Enviando..." : "Adicionar"}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
          <h2 className="font-semibold mb-4">Marcas ({marcas.length})</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {marcas.map(m => (
              <div key={m.id} className="border border-[var(--color-border)] rounded-lg p-3 flex flex-col items-center gap-2">
                <div className="w-20 h-12 relative">
                  <Image src={`/${m.imagem}`} alt={m.nome} fill className="object-contain" />
                </div>
                <p className="text-xs text-center font-medium">{m.nome}</p>
                <button onClick={() => handleDelete(m.id)} className="text-xs text-red-600 hover:underline">Excluir</button>
              </div>
            ))}
            {!marcas.length && <p className="text-[var(--color-text-muted)] text-sm col-span-3 text-center py-8">Nenhuma marca.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
