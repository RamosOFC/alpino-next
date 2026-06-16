"use client"
import { useEffect, useState } from "react"
import Image from "next/image"

type Banner = { id: number; imagem: string; link: string | null; ativo: number | null; ordem: number | null }

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [link, setLink] = useState("")
  const [msg, setMsg] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch("/api/banners").then(r => r.json()).then(setBanners)
  }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    setLoading(true)
    const fd = new FormData()
    fd.append("file", file)
    fd.append("link", link)
    const res = await fetch("/api/banners/upload", { method: "POST", body: fd })
    setLoading(false)
    if (res.ok) {
      const novo = await res.json()
      setBanners(b => [...b, novo])
      setFile(null)
      setLink("")
      setMsg("Banner adicionado!")
      setTimeout(() => setMsg(""), 3000)
    } else {
      const err = await res.json()
      setMsg(err.error ?? "Erro ao adicionar banner")
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Excluir este banner?")) return
    await fetch("/api/banners", { method: "DELETE", body: JSON.stringify({ id }), headers: { "Content-Type": "application/json" } })
    setBanners(b => b.filter(x => x.id !== id))
    setMsg("Banner excluído.")
    setTimeout(() => setMsg(""), 3000)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Banners</h1>
      {msg && <div className={`px-4 py-2 rounded mb-4 text-sm ${msg.includes("Erro") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>✓ {msg}</div>}

      <div className="grid lg:grid-cols-[360px_1fr] gap-6">
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 self-start">
          <h2 className="font-semibold mb-4">Novo Banner</h2>
          <form onSubmit={handleAdd} className="flex flex-col gap-4">
            <div>
              <label className="text-sm text-[var(--color-text-muted)] mb-1 block">Imagem *</label>
              <input type="file" accept="image/*" required
                onChange={e => setFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm border border-[var(--color-border)] rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="text-sm text-[var(--color-text-muted)] mb-1 block">Link (opcional)</label>
              <input type="url" value={link} onChange={e => setLink(e.target.value)}
                placeholder="https://..."
                className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm" />
            </div>
            <button type="submit" disabled={loading}
              className="bg-[var(--color-primary)] text-white rounded-lg py-2 text-sm font-medium hover:bg-[var(--color-primary-dark)] disabled:opacity-50">
              {loading ? "Enviando..." : "Adicionar Banner"}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
          <h2 className="font-semibold mb-4">Banners ({banners.length})</h2>
          <div className="flex flex-col gap-3">
            {banners.map(b => (
              <div key={b.id} className="flex items-center gap-4 border border-[var(--color-border)] rounded-lg p-3">
                <div className="w-24 h-14 relative rounded overflow-hidden bg-[var(--color-surface-2)] flex-shrink-0">
                  {b.imagem && <Image src={`/${b.imagem}`} alt="" fill className="object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[var(--color-text-muted)] truncate">{b.link || "Sem link"}</p>
                  <p className="text-xs text-gray-400">Ordem: {b.ordem}</p>
                </div>
                <button onClick={() => handleDelete(b.id)}
                  className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg flex-shrink-0">
                  Excluir
                </button>
              </div>
            ))}
            {!banners.length && <p className="text-[var(--color-text-muted)] text-sm text-center py-8">Nenhum banner.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
