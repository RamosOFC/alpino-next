"use client"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"

type MenuItem = { id: number; label: string; url: string; target: string | null }

export function Navbar({ items, wpp }: {
  items: MenuItem[]
  wpp: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <header className="bg-white border-b border-[var(--color-border)] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/">
          <Image src="/images/logo.png" alt="Alpino Linhas" width={140} height={40} className="object-contain h-10 w-auto" />
        </Link>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label="Menu"
        >
          <span className="w-6 h-0.5 bg-gray-700 block" />
          <span className="w-6 h-0.5 bg-gray-700 block" />
          <span className="w-6 h-0.5 bg-gray-700 block" />
        </button>

        <nav className={`${open ? "flex" : "hidden"} md:flex flex-col md:flex-row absolute md:static top-16 left-0 w-full md:w-auto bg-white md:bg-transparent border-b md:border-0 border-[var(--color-border)] md:items-center gap-0 md:gap-1 shadow-md md:shadow-none z-40`}>
          {items.map((item) => {
            const isLoja = item.label.toLowerCase().includes("loja")
            return (
              <Link
                key={item.id}
                href={item.url}
                target={item.target ?? "_self"}
                rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                className={isLoja
                  ? "flex items-center gap-1.5 bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg text-sm font-medium mx-2 my-1 md:my-0 hover:bg-[var(--color-primary-dark)]"
                  : "px-4 py-3 md:py-2 text-sm text-gray-700 hover:text-[var(--color-primary)] block"}
              >
                {item.label}
              </Link>
            )
          })}
          <a
            href={`https://wa.me/${wpp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium mx-2 my-1 md:my-0 hover:bg-green-600"
          >
            WhatsApp
          </a>
        </nav>
      </div>
    </header>
  )
}
