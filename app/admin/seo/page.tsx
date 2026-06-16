"use client"
import { useEffect, useState } from "react"

const PAGINAS = [
  { key: "home", label: "Home" },
  { key: "produtos", label: "Produtos" },
  { key: "cartela", label: "Cartela de Cores" },
  { key: "contato", label: "Contato" },
]

// seo_paginas schema: id, pagina, titulo, descricao, og_image (no keywords field)
type SeoRow = { pagina: string; titulo: string | null; descricao: string | null; og_image: string | null }

export default function AdminSeo() {
  const [rows, setRows] = useState<SeoRow[]>(
    PAGINAS.map(p => ({ pagina: p.key, titulo: "", descricao: "", og_image: "" }))
  )
  const [msg, setMsg] = useState("")

  useEffect(() => {
    fetch("/api/seo").then(r => r.json()).then((data: SeoRow[]) => {
      setRows(PAGINAS.map(p => data.find(d => d.pagina === p.key) ?? { pagina: p.key, titulo: "", descricao: "", og_image: "" }))
    })
  }, [])

  function update(pagina: string, field: keyof SeoRow, value: string) {
    setRows(r => r.map(x => x.pagina === pagina ? { ...x, [field]: value } : x))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch("/api/seo", { method: "PUT", body: JSON.stringify(rows), headers: { "Content-Type": "application/json" } })
    if (res.ok) {
      setMsg("SEO salvo!")
      setTimeout(() => setMsg(""), 3000)
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">SEO por Página</h1>
      {msg && <div className="bg-green-50 text-green-700 px-4 py-2 rounded mb-4 text-sm">✓ {msg}</div>}
      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {PAGINAS.map(p => {
          const row = rows.find(r => r.pagina === p.key)!
          return (
            <div key={p.key} className="bg-white rounded-xl border border-[var(--color-border)] p-6">
              <h2 className="font-semibold mb-4">{p.label}</h2>
              <div className="flex flex-col gap-3">
                <input placeholder="Título (60 chars)" maxLength={60} value={row.titulo ?? ""}
                  onChange={e => update(p.key, "titulo", e.target.value)}
                  className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm" />
                <textarea placeholder="Descrição (155 chars)" maxLength={155} rows={2} value={row.descricao ?? ""}
                  onChange={e => update(p.key, "descricao", e.target.value)}
                  className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm resize-none" />
                <input placeholder="OG Image URL" value={row.og_image ?? ""}
                  onChange={e => update(p.key, "og_image", e.target.value)}
                  className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
          )
        })}
        <button type="submit" className="bg-[var(--color-primary)] text-white rounded-lg py-2.5 text-sm font-medium hover:bg-[var(--color-primary-dark)] self-start px-8">
          Salvar SEO
        </button>
      </form>
    </div>
  )
}
