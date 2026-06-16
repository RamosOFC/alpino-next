"use client"
import { useEffect, useState } from "react"

export default function AdminHistoria() {
  const [cfg, setCfg] = useState<Record<string, string>>({})
  const [msg, setMsg] = useState("")

  useEffect(() => {
    fetch("/api/configuracoes").then(r => r.json()).then(setCfg)
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch("/api/configuracoes", {
      method: "PUT",
      body: JSON.stringify({
        slogan: cfg.slogan ?? "",
        historia_badge: cfg.historia_badge ?? "",
        historia_titulo: cfg.historia_titulo ?? "",
        historia_texto1: cfg.historia_texto1 ?? "",
        historia_texto2: cfg.historia_texto2 ?? "",
      }),
      headers: { "Content-Type": "application/json" },
    })
    if (res.ok) {
      setMsg("Salvo com sucesso!")
      setTimeout(() => setMsg(""), 3000)
    }
  }

  const field = (key: string, label: string, multiline = false) => (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">{label}</label>
      {multiline ? (
        <textarea rows={4} value={cfg[key] ?? ""}
          onChange={e => setCfg(c => ({ ...c, [key]: e.target.value }))}
          className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm resize-none" />
      ) : (
        <input type="text" value={cfg[key] ?? ""}
          onChange={e => setCfg(c => ({ ...c, [key]: e.target.value }))}
          className="border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm" />
      )}
    </div>
  )

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">História & Slogan</h1>
      {msg && <div className="bg-green-50 text-green-700 px-4 py-2 rounded mb-4 text-sm">✓ {msg}</div>}
      <form onSubmit={handleSave} className="bg-white rounded-xl border border-[var(--color-border)] p-6 flex flex-col gap-5">
        {field("slogan", "Slogan")}
        {field("historia_badge", "Badge (ex: Desde 1982)")}
        {field("historia_titulo", "Título da Seção")}
        {field("historia_texto1", "Texto Principal", true)}
        {field("historia_texto2", "Texto Complementar", true)}
        <button type="submit" className="bg-[var(--color-primary)] text-white rounded-lg py-2 text-sm font-medium hover:bg-[var(--color-primary-dark)] self-start px-6">
          Salvar
        </button>
      </form>
    </div>
  )
}
