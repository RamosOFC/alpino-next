"use client"
import { useEffect, useState } from "react"
import Image from "next/image"

type Produto = { id: number; nome: string; imagem: string | null; categoria_nome: string | null; ativo: number | null; destaque: number | null }

export default function AdminProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [busca, setBusca] = useState("")
  const [msg, setMsg] = useState("")

  useEffect(() => {
    fetch("/api/produtos?todos=1").then(r => r.json()).then(setProdutos)
  }, [])

  const filtrados = produtos.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (p.categoria_nome ?? "").toLowerCase().includes(busca.toLowerCase())
  )

  async function handleDelete(id: number, nome: string) {
    if (!confirm(`Excluir o produto "${nome}"?`)) return
    await fetch("/api/produtos", { method: "DELETE", body: JSON.stringify({ id }), headers: { "Content-Type": "application/json" } })
    setProdutos(p => p.filter(x => x.id !== id))
    setMsg("Produto excluído.")
    setTimeout(() => setMsg(""), 3000)
  }

  async function toggleDestaque(p: Produto) {
    const updated = await fetch("/api/produtos", {
      method: "PUT",
      body: JSON.stringify({ id: p.id, destaque: p.destaque ? 0 : 1 }),
      headers: { "Content-Type": "application/json" },
    }).then(r => r.json())
    if (updated.id) {
      setProdutos(list => list.map(x => x.id === updated.id ? { ...x, destaque: updated.destaque } : x))
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Produtos</h1>
      {msg && <div className="bg-green-50 text-green-700 px-4 py-2 rounded mb-4 text-sm">✓ {msg}</div>}

      <div className="bg-white rounded-xl border border-[var(--color-border)]">
        <div className="p-4 border-b border-[var(--color-border)] flex gap-3 items-center">
          <input
            type="search"
            placeholder="Buscar produto ou categoria..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="flex-1 border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm"
          />
          <span className="text-sm text-[var(--color-text-muted)] whitespace-nowrap">{filtrados.length} produto(s)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-surface-2)] text-[var(--color-text-muted)]">
              <tr>
                <th className="px-4 py-3 text-left">Produto</th>
                <th className="px-4 py-3 text-left">Categoria</th>
                <th className="px-4 py-3 text-center">Destaque</th>
                <th className="px-4 py-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(p => (
                <tr key={p.id} className="border-t border-[var(--color-border)] hover:bg-[var(--color-surface-2)]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-[var(--color-surface-2)] relative flex-shrink-0 overflow-hidden">
                        {p.imagem && <Image src={`/${p.imagem}`} alt="" fill className="object-cover" />}
                      </div>
                      <span className="truncate max-w-[200px]">{p.nome}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">{p.categoria_nome ?? "—"}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleDestaque(p)}
                      className={`text-xs px-2 py-1 rounded ${p.destaque ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-500"}`}>
                      {p.destaque ? "★ Destaque" : "☆"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => handleDelete(p.id, p.nome)}
                      className="text-xs text-red-600 hover:underline">
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtrados.length && <p className="text-center text-[var(--color-text-muted)] py-10">Nenhum produto encontrado.</p>}
        </div>
      </div>
    </div>
  )
}
