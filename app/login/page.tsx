"use client"
import { signIn } from "next-auth/react"
import { useState, FormEvent } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const form = new FormData(e.currentTarget)
    const result = await signIn("credentials", {
      usuario: form.get("usuario"),
      senha: form.get("senha"),
      redirect: false,
    })
    setLoading(false)
    if (result?.error) {
      setError("Usuário ou senha inválidos.")
    } else {
      router.push("/admin")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-2">
      <div className="bg-white rounded-xl shadow p-8 w-full max-w-sm">
        <h1 className="text-xl font-semibold mb-6 text-center">Admin Alpino</h1>
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            name="usuario"
            type="text"
            placeholder="Usuário"
            required
            className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            name="senha"
            type="password"
            placeholder="Senha"
            required
            className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white rounded-lg py-2 text-sm font-medium hover:bg-primary-dark disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  )
}
