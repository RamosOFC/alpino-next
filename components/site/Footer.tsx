"use client"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-10 mt-16">
      <div className="max-w-6xl mx-auto px-4 text-center text-sm">
        <p className="font-semibold text-white mb-1">Alpino Linhas</p>
        <p>Barro Preto — Belo Horizonte, MG</p>
        <p className="mt-4">© {new Date().getFullYear()} Alpino Linhas. Todos os direitos reservados.</p>
      </div>
    </footer>
  )
}
