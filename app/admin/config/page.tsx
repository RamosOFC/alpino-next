"use client"
import { useEffect, useState } from "react"

export default function AdminConfig() {
  const [cfg, setCfg] = useState<Record<string, string>>({})
  const [msg, setMsg] = useState("")

  useEffect(() => {
    fetch("/api/configuracoes").then(r => r.json()).then(setCfg)
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch("/api/configuracoes", {
      method: "PUT",
      body: JSON.stringify({ whatsapp: cfg.whatsapp ?? "", loja_url: cfg.loja_url ?? "" }),
      headers: { "Content-Type": "application/json" },
    })
    if (res.ok) {
      setMsg("Configurações salvas!")
      setTimeout(() => setMsg(""), 3000)
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Configurações</h1>
      {msg && <div className="bg-green-50 text-green-700 px-4 py-2 rounded mb-4 text-sm">✓ {msg}</div>}
      <form onSubmit={handleSave} className="bg-white rounded-xl border border-[var(--color-border)] p-6 flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Número do WhatsApp</label>
          <input type="text" value={cfg.whatsapp ?? ""} onChange={e => setCfg(c => ({ ...c, whatsapp: e.target.value }))}
            placeholder="5531999999999"
            className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm" />
          <p className="text-xs text-[var(--color-text-muted)] mt-1">Formato: 5531999999999 (sem +)</p>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">URL da Loja Online</label>
          <input type="url" value={cfg.loja_url ?? ""} onChange={e => setCfg(c => ({ ...c, loja_url: e.target.value }))}
            placeholder="https://loja.alpinolinhas.com.br/"
            className="w-full border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="bg-[var(--color-primary)] text-white rounded-lg py-2 text-sm font-medium hover:bg-[var(--color-primary-dark)] self-start px-6">
          Salvar
        </button>
      </form>
    </div>
  )
}
