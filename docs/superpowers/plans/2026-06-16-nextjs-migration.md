# Alpino Linhas — Migração Next.js Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar o site Alpino Linhas de PHP para Next.js 15 com App Router, mantendo o MySQL existente e recriando o painel admin em React.

**Architecture:** Next.js 15 App Router hospedado na Vercel, conectando ao MySQL do cPanel via Prisma ORM. API Routes substituem os arquivos PHP. NextAuth.js v5 protege o painel admin via middleware.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, Prisma ORM, MySQL, NextAuth.js v5 (beta), bcryptjs, Vercel

---

## Mapa de Arquivos

```
alpino-next/
├── auth.ts                              ← config NextAuth (raiz do projeto)
├── middleware.ts                        ← proteção de rotas /admin
├── app/
│   ├── layout.tsx                       ← root layout (fontes, metadata global)
│   ├── (site)/
│   │   ├── layout.tsx                   ← Navbar + Footer
│   │   ├── page.tsx                     ← Home
│   │   ├── produtos/page.tsx            ← Catálogo
│   │   └── cartela/page.tsx             ← Cartela de Cores
│   ├── login/page.tsx                   ← Login admin
│   ├── admin/
│   │   ├── layout.tsx                   ← Sidebar + Topbar
│   │   ├── page.tsx                     ← Dashboard
│   │   ├── banners/page.tsx
│   │   ├── historia/page.tsx
│   │   ├── depoimentos/page.tsx
│   │   ├── marcas/page.tsx
│   │   ├── categorias/page.tsx
│   │   ├── produtos/page.tsx
│   │   ├── menus/page.tsx
│   │   ├── seo/page.tsx
│   │   ├── config/page.tsx
│   │   └── usuarios/page.tsx
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── banners/route.ts
│       ├── produtos/route.ts
│       ├── categorias/route.ts
│       ├── depoimentos/route.ts
│       ├── marcas/route.ts
│       ├── menus/route.ts
│       ├── seo/route.ts
│       ├── configuracoes/route.ts
│       ├── reordenar/route.ts
│       └── usuarios/route.ts
├── components/
│   ├── site/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── Carousel.tsx
│   │   ├── MarcasMarquee.tsx
│   │   └── ProdutoCard.tsx
│   └── admin/
│       ├── Sidebar.tsx
│       ├── Topbar.tsx
│       └── DragList.tsx
├── lib/
│   ├── prisma.ts                        ← singleton PrismaClient
│   └── auth-helpers.ts                  ← requireAuth server helper
└── prisma/
    └── schema.prisma                    ← gerado via db pull
```

---

## Task 1: Scaffold do Projeto

**Files:**
- Create: `alpino-next/` (via create-next-app)
- Create: `alpino-next/.env.local`
- Create: `alpino-next/tailwind.config.ts`

- [ ] **1.1 — Criar projeto**

```bash
cd D:\wampserver\www
npx create-next-app@latest alpino-next --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"
cd alpino-next
```

Responda às perguntas: TypeScript ✓, ESLint ✓, Tailwind ✓, App Router ✓, src/ dir ✗

- [ ] **1.2 — Instalar dependências**

```bash
npm install next-auth@beta @auth/prisma-adapter prisma @prisma/client bcryptjs
npm install -D @types/bcryptjs
```

- [ ] **1.3 — Configurar Tailwind com cores do site**

Substitua o conteúdo de `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2563eb",
        "primary-dark": "#1d4ed8",
        surface: "#ffffff",
        "surface-2": "#f8fafc",
        border: "#e2e8f0",
        "text-muted": "#64748b",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
}

export default config
```

- [ ] **1.4 — Criar .env.local com variáveis**

Crie `alpino-next/.env.local`:

```env
# Preencher com credenciais reais do MySQL do cPanel
DATABASE_URL="mysql://USUARIO:SENHA@HOSTNAME:3306/NOME_DO_BANCO"

# Gerar com: openssl rand -base64 32
NEXTAUTH_SECRET="gere-uma-chave-aleatoria-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

- [ ] **1.5 — Testar dev server**

```bash
npm run dev
```

Abra http://localhost:3000 — deve mostrar a página padrão do Next.js.

- [ ] **1.6 — Commit**

```bash
git init
git add .
git commit -m "feat: scaffold Next.js 15 + Tailwind + dependências"
```

---

## Task 2: Prisma + Conexão MySQL

**Files:**
- Create: `prisma/schema.prisma` (gerado)
- Create: `lib/prisma.ts`

- [ ] **2.1 — Inicializar Prisma**

```bash
npx prisma init --datasource-provider mysql
```

- [ ] **2.2 — Preencher DATABASE_URL no .env.local**

O `.env` criado pelo Prisma pode ser ignorado — o `.env.local` já tem a variável. Certifique-se que o Remote MySQL no cPanel da Task Hosting está habilitado e que o IP externo (ou `%`) está na lista de hosts permitidos.

- [ ] **2.3 — Introspectar o banco existente**

```bash
npx prisma db pull
```

Isso lê o MySQL e gera `prisma/schema.prisma` com todos os models automaticamente. Nenhuma tabela é alterada.

- [ ] **2.4 — Gerar o cliente Prisma**

```bash
npx prisma generate
```

- [ ] **2.5 — Criar singleton do cliente**

Crie `lib/prisma.ts`:

```typescript
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

- [ ] **2.6 — Testar conexão com script rápido**

Crie `scripts/test-db.ts` temporário:

```typescript
import { prisma } from "../lib/prisma"

async function main() {
  const count = await prisma.produtos.count()
  console.log("Produtos no banco:", count)
}

main().then(() => prisma.$disconnect())
```

Execute:

```bash
npx tsx scripts/test-db.ts
```

Esperado: `Produtos no banco: [número]` sem erros.

- [ ] **2.7 — Commit**

```bash
git add prisma/ lib/prisma.ts
git commit -m "feat: Prisma conectado ao MySQL existente via db pull"
```

---

## Task 3: NextAuth + Login + Middleware

**Files:**
- Create: `auth.ts`
- Create: `middleware.ts`
- Create: `app/api/auth/[...nextauth]/route.ts`
- Create: `app/login/page.tsx`

- [ ] **3.1 — Criar configuração NextAuth**

Crie `auth.ts` na raiz:

```typescript
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        senha: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.senha) return null
        const user = await prisma.usuarios.findFirst({
          where: { email: credentials.email as string },
        })
        if (!user) return null
        const valid = await bcrypt.compare(credentials.senha as string, user.senha)
        if (!valid) return null
        return { id: String(user.id), name: user.nome, email: user.email }
      },
    }),
  ],
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
})
```

- [ ] **3.2 — Criar API route do NextAuth**

Crie `app/api/auth/[...nextauth]/route.ts`:

```typescript
import { handlers } from "@/auth"
export const { GET, POST } = handlers
```

- [ ] **3.3 — Criar middleware de proteção**

Crie `middleware.ts` na raiz:

```typescript
import { auth } from "./auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  if (!req.auth && req.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/login", req.url))
  }
})

export const config = {
  matcher: ["/admin/:path*"],
}
```

- [ ] **3.4 — Criar helper de autenticação para API Routes**

Crie `lib/auth-helpers.ts`:

```typescript
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export async function requireAuth() {
  const session = await auth()
  if (!session) {
    return { error: NextResponse.json({ error: "Não autorizado" }, { status: 401 }) }
  }
  return { session }
}
```

- [ ] **3.5 — Criar página de login**

Crie `app/login/page.tsx`:

```tsx
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
      email: form.get("email"),
      senha: form.get("senha"),
      redirect: false,
    })
    setLoading(false)
    if (result?.error) {
      setError("Email ou senha inválidos.")
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
            name="email"
            type="email"
            placeholder="Email"
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
```

- [ ] **3.6 — Testar login**

```bash
npm run dev
```

Acesse http://localhost:3000/admin — deve redirecionar para /login. Tente logar com um usuário do banco.

- [ ] **3.7 — Commit**

```bash
git add auth.ts middleware.ts app/api/auth app/login lib/auth-helpers.ts
git commit -m "feat: NextAuth com login por credenciais e middleware /admin"
```

---

## Task 4: API Routes — Leitura Pública

**Files:**
- Create: `app/api/banners/route.ts`
- Create: `app/api/produtos/route.ts`
- Create: `app/api/categorias/route.ts`
- Create: `app/api/marcas/route.ts`
- Create: `app/api/depoimentos/route.ts`
- Create: `app/api/configuracoes/route.ts`
- Create: `app/api/menus/route.ts`

- [ ] **4.1 — API de banners**

Crie `app/api/banners/route.ts`:

```typescript
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"

export async function GET() {
  const banners = await prisma.banners.findMany({
    where: { ativo: 1 },
    orderBy: [{ ordem: "asc" }, { id: "asc" }],
  })
  return NextResponse.json(banners)
}

export async function POST(req: Request) {
  const { error } = await requireAuth()
  if (error) return error
  const body = await req.json()
  const banner = await prisma.banners.create({ data: body })
  return NextResponse.json(banner, { status: 201 })
}

export async function PUT(req: Request) {
  const { error } = await requireAuth()
  if (error) return error
  const body = await req.json()
  const { id, ...data } = body
  const banner = await prisma.banners.update({ where: { id }, data })
  return NextResponse.json(banner)
}

export async function DELETE(req: Request) {
  const { error } = await requireAuth()
  if (error) return error
  const { id } = await req.json()
  await prisma.banners.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
```

- [ ] **4.2 — API de configurações**

Crie `app/api/configuracoes/route.ts`:

```typescript
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const rows = await prisma.configuracoes.findMany()
  const cfg: Record<string, string> = {}
  for (const row of rows) cfg[row.chave] = row.valor ?? ""
  return NextResponse.json(cfg)
}
```

- [ ] **4.3 — API de menus**

Crie `app/api/menus/route.ts`:

```typescript
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"

export async function GET(req: Request) {
  const tipo = new URL(req.url).searchParams.get("tipo") ?? "nav"
  const items = await prisma.menu_items.findMany({
    where: { tipo, ativo: 1 },
    orderBy: { ordem: "asc" },
  })
  return NextResponse.json(items)
}

export async function POST(req: Request) {
  const { error } = await requireAuth()
  if (error) return error
  const body = await req.json()
  const item = await prisma.menu_items.create({ data: body })
  return NextResponse.json(item, { status: 201 })
}

export async function PUT(req: Request) {
  const { error } = await requireAuth()
  if (error) return error
  const body = await req.json()
  const { id, ...data } = body
  const item = await prisma.menu_items.update({ where: { id }, data })
  return NextResponse.json(item)
}

export async function DELETE(req: Request) {
  const { error } = await requireAuth()
  if (error) return error
  const { id } = await req.json()
  await prisma.menu_items.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
```

- [ ] **4.4 — API de produtos**

Crie `app/api/produtos/route.ts`:

```typescript
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const categoria = url.searchParams.get("categoria")
  const destaque = url.searchParams.get("destaque")

  const produtos = await prisma.produtos.findMany({
    where: {
      ativo: 1,
      ...(categoria ? { categoria_nome: categoria } : {}),
      ...(destaque === "1" ? { destaque: 1 } : {}),
    },
    orderBy: [{ ordem: "asc" }, { id: "asc" }],
  })
  return NextResponse.json(produtos)
}

export async function POST(req: Request) {
  const { error } = await requireAuth()
  if (error) return error
  const body = await req.json()
  const produto = await prisma.produtos.create({ data: body })
  return NextResponse.json(produto, { status: 201 })
}

export async function PUT(req: Request) {
  const { error } = await requireAuth()
  if (error) return error
  const body = await req.json()
  const { id, ...data } = body
  const produto = await prisma.produtos.update({ where: { id }, data })
  return NextResponse.json(produto)
}

export async function DELETE(req: Request) {
  const { error } = await requireAuth()
  if (error) return error
  const { id } = await req.json()
  await prisma.produtos.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
```

- [ ] **4.5 — API de categorias**

Crie `app/api/categorias/route.ts`:

```typescript
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const categorias = await prisma.categorias.findMany({
    where: { ativo: 1 },
    orderBy: { ordem: "asc" },
    include: {
      subcategorias: {
        where: { ativo: 1 },
        orderBy: { ordem: "asc" },
      },
    },
  })
  return NextResponse.json(categorias)
}
```

- [ ] **4.6 — APIs de marcas e depoimentos**

Crie `app/api/marcas/route.ts`:

```typescript
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"

export async function GET() {
  const marcas = await prisma.marcas.findMany({
    where: { ativo: 1 },
    orderBy: { ordem: "asc" },
  })
  return NextResponse.json(marcas)
}

export async function POST(req: Request) {
  const { error } = await requireAuth()
  if (error) return error
  const body = await req.json()
  const marca = await prisma.marcas.create({ data: body })
  return NextResponse.json(marca, { status: 201 })
}

export async function PUT(req: Request) {
  const { error } = await requireAuth()
  if (error) return error
  const body = await req.json()
  const { id, ...data } = body
  const marca = await prisma.marcas.update({ where: { id }, data })
  return NextResponse.json(marca)
}

export async function DELETE(req: Request) {
  const { error } = await requireAuth()
  if (error) return error
  const { id } = await req.json()
  await prisma.marcas.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
```

Crie `app/api/depoimentos/route.ts`:

```typescript
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"

export async function GET() {
  const depoimentos = await prisma.depoimentos.findMany({
    where: { ativo: 1 },
    orderBy: { ordem: "asc" },
  })
  return NextResponse.json(depoimentos)
}

export async function POST(req: Request) {
  const { error } = await requireAuth()
  if (error) return error
  const body = await req.json()
  const max = await prisma.depoimentos.aggregate({ _max: { ordem: true } })
  const dep = await prisma.depoimentos.create({
    data: { ...body, ordem: (max._max.ordem ?? 0) + 1 },
  })
  return NextResponse.json(dep, { status: 201 })
}

export async function PUT(req: Request) {
  const { error } = await requireAuth()
  if (error) return error
  const body = await req.json()
  const { id, ...data } = body
  const dep = await prisma.depoimentos.update({ where: { id }, data })
  return NextResponse.json(dep)
}

export async function DELETE(req: Request) {
  const { error } = await requireAuth()
  if (error) return error
  const { id } = await req.json()
  await prisma.depoimentos.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
```

- [ ] **4.7 — API de reordenação**

Crie `app/api/reordenar/route.ts`:

```typescript
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"

const ALLOWED = ["banners","produtos","depoimentos","marcas","menu_items","categorias","subcategorias"] as const
type Tabela = typeof ALLOWED[number]

export async function POST(req: Request) {
  const { error } = await requireAuth()
  if (error) return error
  const { tabela, ids }: { tabela: string; ids: number[] } = await req.json()
  if (!ALLOWED.includes(tabela as Tabela)) {
    return NextResponse.json({ error: "Tabela inválida" }, { status: 400 })
  }
  await Promise.all(
    ids.map((id, i) =>
      (prisma[tabela as Tabela] as any).update({ where: { id: Number(id) }, data: { ordem: i + 1 } })
    )
  )
  return NextResponse.json({ ok: true })
}
```

- [ ] **4.8 — Testar APIs no browser**

Com `npm run dev` rodando, acesse:
- http://localhost:3000/api/banners → deve retornar JSON com banners
- http://localhost:3000/api/configuracoes → deve retornar objeto com chaves/valores
- http://localhost:3000/api/produtos → deve retornar lista de produtos

- [ ] **4.9 — Commit**

```bash
git add app/api/
git commit -m "feat: API Routes CRUD para banners, produtos, marcas, depoimentos, menus, config"
```

---

## Task 5: Componentes do Site Público

**Files:**
- Create: `components/site/Navbar.tsx`
- Create: `components/site/Footer.tsx`
- Create: `components/site/Carousel.tsx`
- Create: `components/site/MarcasMarquee.tsx`
- Create: `components/site/ProdutoCard.tsx`
- Create: `app/(site)/layout.tsx`

- [ ] **5.1 — Navbar**

Crie `components/site/Navbar.tsx`:

```tsx
"use client"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"

type MenuItem = { id: number; label: string; url: string; target: string }

export function Navbar({ items, wpp, lojaUrl }: {
  items: MenuItem[]
  wpp: string
  lojaUrl: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/">
          <Image src="/images/logo.png" alt="Alpino Linhas" width={140} height={40} />
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

        <nav className={`${open ? "flex" : "hidden"} md:flex flex-col md:flex-row absolute md:static top-16 left-0 w-full md:w-auto bg-white md:bg-transparent border-b md:border-0 border-border md:items-center gap-0 md:gap-1 shadow-md md:shadow-none z-40`}>
          {items.map((item) => {
            const isLoja = item.label.toLowerCase().includes("loja")
            return (
              <Link
                key={item.id}
                href={item.url}
                target={item.target ?? "_self"}
                rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                className={isLoja
                  ? "flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium mx-2 my-1 md:my-0 hover:bg-primary-dark"
                  : "px-4 py-3 md:py-2 text-sm text-gray-700 hover:text-primary block"}
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
```

- [ ] **5.2 — Footer**

Crie `components/site/Footer.tsx`:

```tsx
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
```

- [ ] **5.3 — Carousel**

Crie `components/site/Carousel.tsx`:

```tsx
"use client"
import Image from "next/image"
import { useState, useEffect } from "react"
import Link from "next/link"

type Banner = { id: number; imagem: string; link: string | null }

export function Carousel({ banners }: { banners: Banner[] }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setCurrent((c) => (c + 1) % banners.length), 5000)
    return () => clearInterval(t)
  }, [banners.length])

  if (!banners.length) return null

  return (
    <div className="relative w-full aspect-[16/5] overflow-hidden bg-gray-100">
      {banners.map((b, i) => {
        const img = (
          <Image
            key={b.id}
            src={`/${b.imagem}`}
            alt={`Banner ${i + 1}`}
            fill
            className={`object-cover transition-opacity duration-700 ${i === current ? "opacity-100" : "opacity-0"}`}
            priority={i === 0}
          />
        )
        return b.link ? <Link key={b.id} href={b.link} target="_blank" rel="noopener">{img}</Link> : img
      })}
      <button onClick={() => setCurrent((c) => (c - 1 + banners.length) % banners.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/60">❮</button>
      <button onClick={() => setCurrent((c) => (c + 1) % banners.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/60">❯</button>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {banners.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${i === current ? "bg-white" : "bg-white/40"}`} />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **5.4 — MarcasMarquee**

Crie `components/site/MarcasMarquee.tsx`:

```tsx
import Image from "next/image"

type Marca = { id: number; imagem: string; nome: string; link: string | null }

export function MarcasMarquee({ marcas }: { marcas: Marca[] }) {
  const doubled = [...marcas, ...marcas]
  return (
    <section className="py-12 overflow-hidden">
      <h2 className="text-2xl font-bold text-center mb-8">Marcas que Trabalhamos</h2>
      <div className="flex gap-8 animate-marquee">
        {doubled.map((m, i) => (
          <div key={i} className="flex-shrink-0 w-32 h-16 relative grayscale hover:grayscale-0 transition-all">
            <Image src={`/${m.imagem}`} alt={m.nome} fill className="object-contain" />
          </div>
        ))}
      </div>
    </section>
  )
}
```

Adicione em `tailwind.config.ts` dentro de `extend`:

```typescript
animation: {
  marquee: "marquee 30s linear infinite",
},
keyframes: {
  marquee: {
    "0%": { transform: "translateX(0)" },
    "100%": { transform: "translateX(-50%)" },
  },
},
```

- [ ] **5.5 — Layout do site público**

Crie `app/(site)/layout.tsx`:

```tsx
import { Navbar } from "@/components/site/Navbar"
import { Footer } from "@/components/site/Footer"

async function getMenuItems() {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/menus?tipo=nav`, { cache: "no-store" })
  if (!res.ok) return []
  return res.json()
}

async function getCfg() {
  const res = await fetch(`${process.env.NEXTAUTH_URL}/api/configuracoes`, { cache: "no-store" })
  if (!res.ok) return {}
  return res.json()
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [items, cfg] = await Promise.all([getMenuItems(), getCfg()])

  return (
    <>
      <Navbar
        items={items}
        wpp={cfg.whatsapp ?? "5531995786466"}
        lojaUrl={cfg.loja_url ?? "https://loja.alpinolinhas.com.br/"}
      />
      <main>{children}</main>
      <Footer />
    </>
  )
}
```

- [ ] **5.6 — Commit**

```bash
git add components/ app/\(site\)/layout.tsx
git commit -m "feat: componentes Navbar, Footer, Carousel, MarcasMarquee"
```

---

## Task 6: Home Page

**Files:**
- Create: `app/(site)/page.tsx`

- [ ] **6.1 — Home page completa**

Crie `app/(site)/page.tsx`:

```tsx
import { Carousel } from "@/components/site/Carousel"
import { MarcasMarquee } from "@/components/site/MarcasMarquee"
import Image from "next/image"
import Link from "next/link"

async function getData() {
  const base = process.env.NEXTAUTH_URL!
  const [banners, cfg, marcas, depoimentos, produtos] = await Promise.all([
    fetch(`${base}/api/banners`, { cache: "no-store" }).then(r => r.json()),
    fetch(`${base}/api/configuracoes`, { cache: "no-store" }).then(r => r.json()),
    fetch(`${base}/api/marcas`, { cache: "no-store" }).then(r => r.json()),
    fetch(`${base}/api/depoimentos`, { cache: "no-store" }).then(r => r.json()),
    fetch(`${base}/api/produtos?destaque=1`, { cache: "no-store" }).then(r => r.json()),
  ])
  return { banners, cfg, marcas, depoimentos, produtos }
}

export default async function Home() {
  const { banners, cfg, marcas, depoimentos, produtos } = await getData()

  return (
    <>
      <Carousel banners={banners} />

      {/* Slogan */}
      <section className="py-10 bg-surface-2 text-center">
        <p className="text-lg text-gray-600 italic max-w-2xl mx-auto px-4">
          "{cfg.slogan ?? "Tudo em aviamentos para a sua criação"}"
        </p>
      </section>

      {/* Produtos em destaque */}
      {produtos.length > 0 && (
        <section className="py-16 max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Conheça nossos produtos:</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {produtos.map((p: any) => (
              <Link href="/produtos" key={p.id}
                className="border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-square bg-surface-2 relative">
                  {p.imagem ? (
                    <Image src={`/${p.imagem}`} alt={p.nome} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">🛍️</div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium truncate">{p.nome}</p>
                  <p className="text-xs text-text-muted">{p.categoria_nome}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* História */}
      <section id="historia" className="py-16 bg-surface-2">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <span className="inline-block bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded-full mb-4">
            {cfg.historia_badge ?? "Desde 1982"}
          </span>
          <h2 className="text-3xl font-bold mb-6">{cfg.historia_titulo ?? "Alpino Linhas"}</h2>
          <p className="text-gray-600 leading-relaxed mb-4">{cfg.historia_texto1}</p>
          {cfg.historia_texto2 && (
            <p className="text-gray-600 leading-relaxed">{cfg.historia_texto2}</p>
          )}
        </div>
      </section>

      {/* Marcas */}
      <MarcasMarquee marcas={marcas} />

      {/* Depoimentos */}
      {depoimentos.length > 0 && (
        <section className="py-16 bg-surface-2">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-10">O que nossos clientes dizem</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {depoimentos.map((d: any) => (
                <div key={d.id} className="bg-white rounded-xl p-6 shadow-sm border border-border">
                  <div className="text-yellow-400 mb-3">★★★★★</div>
                  <p className="text-gray-600 text-sm mb-4">"{d.texto}"</p>
                  <p className="font-semibold text-sm">{d.nome}{d.cargo ? ` · ${d.cargo}` : ""}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section id="contato" className="py-20 bg-primary text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Encontre o que você precisa</h2>
          <p className="mb-8 opacity-90">Navegue pelo nosso catálogo ou fale direto com a gente.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/produtos"
              className="bg-white text-primary px-6 py-3 rounded-lg font-medium hover:bg-gray-100">
              Ver Catálogo
            </Link>
            <a href={`https://wa.me/${cfg.whatsapp ?? "5531995786466"}`}
              target="_blank" rel="noopener noreferrer"
              className="border-2 border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10">
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
```

- [ ] **6.2 — Testar home**

```bash
npm run dev
```

Acesse http://localhost:3000 — deve exibir banners, slogan, produtos destaque, história, marcas e depoimentos do banco.

- [ ] **6.3 — Commit**

```bash
git add app/\(site\)/page.tsx
git commit -m "feat: home page completa com dados do banco"
```

---

## Task 7: Página de Produtos

**Files:**
- Create: `app/(site)/produtos/page.tsx`

- [ ] **7.1 — Página de produtos com filtro por categoria**

Crie `app/(site)/produtos/page.tsx`:

```tsx
import Image from "next/image"
import Link from "next/link"

async function getData() {
  const base = process.env.NEXTAUTH_URL!
  const [categorias, produtos] = await Promise.all([
    fetch(`${base}/api/categorias`, { cache: "no-store" }).then(r => r.json()),
    fetch(`${base}/api/produtos`, { cache: "no-store" }).then(r => r.json()),
  ])
  return { categorias, produtos }
}

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: { categoria?: string }
}) {
  const { categorias, produtos } = await getData()
  const catAtiva = searchParams.categoria ?? ""
  const filtrados = catAtiva
    ? produtos.filter((p: any) => p.categoria_nome === catAtiva)
    : produtos

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Nossos Produtos</h1>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-10">
        <Link href="/produtos"
          className={`px-4 py-2 rounded-full text-sm border ${!catAtiva ? "bg-primary text-white border-primary" : "border-border hover:border-primary"}`}>
          Todos
        </Link>
        {categorias.map((c: any) => (
          <Link key={c.id} href={`/produtos?categoria=${encodeURIComponent(c.nome)}`}
            className={`px-4 py-2 rounded-full text-sm border ${catAtiva === c.nome ? "bg-primary text-white border-primary" : "border-border hover:border-primary"}`}>
            {c.nome}
          </Link>
        ))}
      </div>

      {/* Grid */}
      {filtrados.length === 0 ? (
        <p className="text-text-muted text-center py-20">Nenhum produto encontrado.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtrados.map((p: any) => (
            <div key={p.id} className="border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-square bg-surface-2 relative">
                {p.imagem ? (
                  <Image src={`/${p.imagem}`} alt={p.nome} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">🛍️</div>
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-medium">{p.nome}</p>
                <p className="text-xs text-text-muted mt-0.5">{p.categoria_nome}</p>
                {p.descricao && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.descricao}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **7.2 — Testar página de produtos**

Acesse http://localhost:3000/produtos — deve exibir grid de produtos com filtro por categoria funcionando.

- [ ] **7.3 — Commit**

```bash
git add app/\(site\)/produtos/
git commit -m "feat: página de produtos com filtro por categoria"
```

---

## Task 8: Layout e Dashboard Admin

**Files:**
- Create: `components/admin/Sidebar.tsx`
- Create: `components/admin/Topbar.tsx`
- Create: `app/admin/layout.tsx`
- Create: `app/admin/page.tsx`

- [ ] **8.1 — Sidebar do admin**

Crie `components/admin/Sidebar.tsx`:

```tsx
"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"

const navItems = [
  { label: "Dashboard", href: "/admin", icon: "⊞", section: "Principal" },
  { label: "Banners", href: "/admin/banners", icon: "🖼", section: "Conteúdo" },
  { label: "História & Slogan", href: "/admin/historia", icon: "✏️", section: "Conteúdo" },
  { label: "Depoimentos", href: "/admin/depoimentos", icon: "💬", section: "Conteúdo" },
  { label: "Marcas Parceiras", href: "/admin/marcas", icon: "🏅", section: "Conteúdo" },
  { label: "Categorias", href: "/admin/categorias", icon: "≡", section: "Conteúdo" },
  { label: "Produtos", href: "/admin/produtos", icon: "📦", section: "Conteúdo" },
  { label: "Menus", href: "/admin/menus", icon: "☰", section: "Site" },
  { label: "SEO", href: "/admin/seo", icon: "🔍", section: "Site" },
  { label: "Configurações", href: "/admin/config", icon: "⚙️", section: "Site" },
  { label: "Usuários", href: "/admin/usuarios", icon: "👥", section: "Site" },
]

const sections = ["Principal", "Conteúdo", "Site"]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-60 min-h-screen bg-gray-900 text-gray-300 flex flex-col flex-shrink-0">
      <div className="p-5 border-b border-gray-700">
        <p className="text-white font-semibold text-sm">Alpino Linhas</p>
        <p className="text-gray-400 text-xs mt-0.5">Painel Admin</p>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        {sections.map((section) => (
          <div key={section} className="mb-2">
            <p className="px-5 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">{section}</p>
            {navItems
              .filter((i) => i.section === section)
              .map((item) => {
                const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
                return (
                  <Link key={item.href} href={item.href}
                    className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${isActive ? "bg-primary text-white" : "hover:bg-gray-800 hover:text-white"}`}>
                    <span>{item.icon}</span>
                    {item.label}
                  </Link>
                )
              })}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700 flex flex-col gap-2">
        <Link href="/" target="_blank" className="text-xs text-gray-400 hover:text-white text-center">↗ Ver Site</Link>
        <button onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-xs text-gray-400 hover:text-red-400 text-center">
          Sair
        </button>
      </div>
    </aside>
  )
}
```

- [ ] **8.2 — Layout do admin**

Crie `app/admin/layout.tsx`:

```tsx
import { Sidebar } from "@/components/admin/Sidebar"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <div className="flex min-h-screen bg-surface-2">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-border px-6 h-14 flex items-center justify-between">
          <span className="text-sm text-text-muted">Bem-vindo, {session.user?.name}</span>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
```

- [ ] **8.3 — Dashboard**

Crie `app/admin/page.tsx`:

```tsx
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function AdminDashboard() {
  const [totalProdutos, totalBanners, totalDepoimentos] = await Promise.all([
    prisma.produtos.count({ where: { ativo: 1 } }),
    prisma.banners.count({ where: { ativo: 1 } }),
    prisma.depoimentos.count({ where: { ativo: 1 } }),
  ])

  const cards = [
    { label: "Produtos ativos", value: totalProdutos, href: "/admin/produtos" },
    { label: "Banners ativos", value: totalBanners, href: "/admin/banners" },
    { label: "Depoimentos", value: totalDepoimentos, href: "/admin/depoimentos" },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {cards.map((c) => (
          <Link key={c.label} href={c.href}
            className="bg-white rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
            <p className="text-3xl font-bold text-primary mb-1">{c.value}</p>
            <p className="text-sm text-text-muted">{c.label}</p>
          </Link>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-border p-6">
        <h2 className="font-semibold mb-4">Acesso Rápido</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Novo Produto", href: "/admin/produtos?new=1" },
            { label: "Novo Banner", href: "/admin/banners?new=1" },
            { label: "Novo Depoimento", href: "/admin/depoimentos?new=1" },
            { label: "Ver Site", href: "/", target: "_blank" },
          ].map((a) => (
            <Link key={a.label} href={a.href} target={(a as any).target}
              className="text-center bg-surface-2 hover:bg-primary/10 text-sm px-4 py-3 rounded-lg border border-border hover:border-primary transition-colors">
              {a.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **8.4 — Testar admin**

Acesse http://localhost:3000/admin — deve mostrar o dashboard com sidebar e contadores do banco.

- [ ] **8.5 — Commit**

```bash
git add components/admin/ app/admin/
git commit -m "feat: layout e dashboard do painel admin"
```

---

## Task 9: Admin — Banners e Produtos

**Files:**
- Create: `app/admin/banners/page.tsx`
- Create: `app/admin/produtos/page.tsx`

- [ ] **9.1 — Admin Banners**

Crie `app/admin/banners/page.tsx`:

```tsx
"use client"
import { useEffect, useState } from "react"
import Image from "next/image"

type Banner = { id: number; imagem: string; link: string; ativo: number; ordem: number }

export default function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [link, setLink] = useState("")
  const [msg, setMsg] = useState("")

  useEffect(() => {
    fetch("/api/banners").then(r => r.json()).then(setBanners)
  }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    // Upload da imagem via FormData para a API
    const fd = new FormData()
    fd.append("file", file)
    fd.append("link", link)
    const res = await fetch("/api/banners/upload", { method: "POST", body: fd })
    if (res.ok) {
      const novo = await res.json()
      setBanners(b => [...b, novo])
      setFile(null)
      setLink("")
      setMsg("Banner adicionado!")
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Excluir este banner?")) return
    await fetch("/api/banners", { method: "DELETE", body: JSON.stringify({ id }), headers: { "Content-Type": "application/json" } })
    setBanners(b => b.filter(x => x.id !== id))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Banners</h1>
      {msg && <div className="bg-green-50 text-green-700 px-4 py-2 rounded mb-4 text-sm">{msg}</div>}

      <div className="grid lg:grid-cols-[360px_1fr] gap-6">
        <div className="bg-white rounded-xl border border-border p-6">
          <h2 className="font-semibold mb-4">Novo Banner</h2>
          <form onSubmit={handleAdd} className="flex flex-col gap-4">
            <div>
              <label className="text-sm text-text-muted mb-1 block">Imagem *</label>
              <input type="file" accept="image/*" required
                onChange={e => setFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm border border-border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="text-sm text-text-muted mb-1 block">Link (opcional)</label>
              <input type="url" value={link} onChange={e => setLink(e.target.value)}
                placeholder="https://..."
                className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
            </div>
            <button type="submit" className="bg-primary text-white rounded-lg py-2 text-sm font-medium hover:bg-primary-dark">
              Adicionar Banner
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl border border-border p-6">
          <h2 className="font-semibold mb-4">Banners ({banners.length})</h2>
          <div className="flex flex-col gap-3">
            {banners.map(b => (
              <div key={b.id} className="flex items-center gap-4 border border-border rounded-lg p-3">
                <div className="w-24 h-14 relative rounded overflow-hidden bg-surface-2 flex-shrink-0">
                  <Image src={`/${b.imagem}`} alt="" fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text-muted truncate">{b.link || "Sem link"}</p>
                </div>
                <button onClick={() => handleDelete(b.id)}
                  className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg">
                  Excluir
                </button>
              </div>
            ))}
            {!banners.length && <p className="text-text-muted text-sm text-center py-8">Nenhum banner.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **9.2 — API de upload de banners**

Crie `app/api/banners/upload/route.ts`:

```typescript
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(req: Request) {
  const { error } = await requireAuth()
  if (error) return error

  const form = await req.formData()
  const file = form.get("file") as File
  const link = (form.get("link") as string) ?? ""

  if (!file) return NextResponse.json({ error: "Arquivo obrigatório" }, { status: 400 })

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const ext = path.extname(file.name).toLowerCase()
  const filename = `banner_${Date.now()}${ext}`
  const uploadDir = path.join(process.cwd(), "public", "images", "slides")

  await mkdir(uploadDir, { recursive: true })
  await writeFile(path.join(uploadDir, filename), buffer)

  const max = await prisma.banners.aggregate({ _max: { ordem: true } })
  const banner = await prisma.banners.create({
    data: {
      imagem: `images/slides/${filename}`,
      link,
      ativo: 1,
      ordem: (max._max.ordem ?? 0) + 1,
    },
  })

  return NextResponse.json(banner, { status: 201 })
}
```

- [ ] **9.3 — Admin Produtos**

Crie `app/admin/produtos/page.tsx`:

```tsx
"use client"
import { useEffect, useState } from "react"
import Image from "next/image"

type Produto = { id: number; nome: string; imagem: string; categoria_nome: string; ativo: number; destaque: number }

export default function AdminProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [busca, setBusca] = useState("")
  const [msg, setMsg] = useState("")

  useEffect(() => {
    fetch("/api/produtos?todos=1").then(r => r.json()).then(setProdutos)
  }, [])

  const filtrados = produtos.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    p.categoria_nome.toLowerCase().includes(busca.toLowerCase())
  )

  async function handleDelete(id: number, nome: string) {
    if (!confirm(`Excluir o produto "${nome}"?`)) return
    await fetch("/api/produtos", { method: "DELETE", body: JSON.stringify({ id }), headers: { "Content-Type": "application/json" } })
    setProdutos(p => p.filter(x => x.id !== id))
    setMsg("Produto excluído.")
  }

  async function toggleDestaque(p: Produto) {
    const updated = await fetch("/api/produtos", {
      method: "PUT",
      body: JSON.stringify({ id: p.id, destaque: p.destaque ? 0 : 1 }),
      headers: { "Content-Type": "application/json" },
    }).then(r => r.json())
    setProdutos(list => list.map(x => x.id === updated.id ? { ...x, destaque: updated.destaque } : x))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Produtos</h1>
      {msg && <div className="bg-green-50 text-green-700 px-4 py-2 rounded mb-4 text-sm">{msg}</div>}

      <div className="bg-white rounded-xl border border-border">
        <div className="p-4 border-b border-border flex gap-3 items-center">
          <input
            type="search"
            placeholder="Buscar produto..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="flex-1 border border-border rounded-lg px-3 py-2 text-sm"
          />
          <span className="text-sm text-text-muted">{filtrados.length} produto(s)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-2 text-text-muted">
              <tr>
                <th className="px-4 py-3 text-left">Produto</th>
                <th className="px-4 py-3 text-left">Categoria</th>
                <th className="px-4 py-3 text-center">Destaque</th>
                <th className="px-4 py-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(p => (
                <tr key={p.id} className="border-t border-border hover:bg-surface-2/50">
                  <td className="px-4 py-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-surface-2 relative flex-shrink-0">
                      {p.imagem && <Image src={`/${p.imagem}`} alt="" fill className="object-cover rounded" />}
                    </div>
                    {p.nome}
                  </td>
                  <td className="px-4 py-3 text-text-muted">{p.categoria_nome}</td>
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
          {!filtrados.length && <p className="text-center text-text-muted py-10">Nenhum produto encontrado.</p>}
        </div>
      </div>
    </div>
  )
}
```

Atualize `app/api/produtos/route.ts` — adicione suporte ao parâmetro `?todos=1` no GET:

```typescript
// Dentro do GET, altere o where:
const todos = url.searchParams.get("todos") === "1"
const produtos = await prisma.produtos.findMany({
  where: {
    ...(todos ? {} : { ativo: 1 }),
    ...(categoria ? { categoria_nome: categoria } : {}),
    ...(destaque === "1" ? { destaque: 1 } : {}),
  },
  orderBy: [{ ordem: "asc" }, { id: "asc" }],
})
```

- [ ] **9.4 — Testar admin banners e produtos**

- http://localhost:3000/admin/banners — deve listar banners e permitir upload
- http://localhost:3000/admin/produtos — deve listar todos os produtos com busca e toggle destaque

- [ ] **9.5 — Commit**

```bash
git add app/admin/banners/ app/admin/produtos/ app/api/banners/
git commit -m "feat: admin banners com upload e admin produtos com busca"
```

---

## Task 10: Admin — Páginas de Conteúdo

**Files:**
- Create: `app/admin/historia/page.tsx`
- Create: `app/admin/depoimentos/page.tsx`
- Create: `app/admin/marcas/page.tsx`
- Create: `app/api/configuracoes/route.ts` (atualizar para PUT)

- [ ] **10.1 — API configuracoes com PUT**

Atualize `app/api/configuracoes/route.ts`:

```typescript
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"

export async function GET() {
  const rows = await prisma.configuracoes.findMany()
  const cfg: Record<string, string> = {}
  for (const row of rows) cfg[row.chave] = row.valor ?? ""
  return NextResponse.json(cfg)
}

export async function PUT(req: Request) {
  const { error } = await requireAuth()
  if (error) return error
  const body: Record<string, string> = await req.json()
  await Promise.all(
    Object.entries(body).map(([chave, valor]) =>
      prisma.configuracoes.upsert({
        where: { chave },
        update: { valor },
        create: { chave, valor },
      })
    )
  )
  return NextResponse.json({ ok: true })
}
```

- [ ] **10.2 — Admin História & Slogan**

Crie `app/admin/historia/page.tsx`:

```tsx
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
    await fetch("/api/configuracoes", {
      method: "PUT",
      body: JSON.stringify({
        slogan: cfg.slogan,
        historia_badge: cfg.historia_badge,
        historia_titulo: cfg.historia_titulo,
        historia_texto1: cfg.historia_texto1,
        historia_texto2: cfg.historia_texto2,
      }),
      headers: { "Content-Type": "application/json" },
    })
    setMsg("Salvo com sucesso!")
    setTimeout(() => setMsg(""), 3000)
  }

  const field = (key: string, label: string, multiline = false) => (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">{label}</label>
      {multiline ? (
        <textarea rows={4} value={cfg[key] ?? ""}
          onChange={e => setCfg(c => ({ ...c, [key]: e.target.value }))}
          className="border border-border rounded-lg px-3 py-2 text-sm" />
      ) : (
        <input type="text" value={cfg[key] ?? ""}
          onChange={e => setCfg(c => ({ ...c, [key]: e.target.value }))}
          className="border border-border rounded-lg px-3 py-2 text-sm" />
      )}
    </div>
  )

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">História & Slogan</h1>
      {msg && <div className="bg-green-50 text-green-700 px-4 py-2 rounded mb-4 text-sm">✓ {msg}</div>}
      <form onSubmit={handleSave} className="bg-white rounded-xl border border-border p-6 flex flex-col gap-5">
        {field("slogan", "Slogan")}
        {field("historia_badge", "Badge (ex: Desde 1982)")}
        {field("historia_titulo", "Título da Seção")}
        {field("historia_texto1", "Texto Principal", true)}
        {field("historia_texto2", "Texto Complementar", true)}
        <button type="submit" className="bg-primary text-white rounded-lg py-2 text-sm font-medium hover:bg-primary-dark self-start px-6">
          Salvar
        </button>
      </form>
    </div>
  )
}
```

- [ ] **10.3 — Admin Depoimentos**

Crie `app/admin/depoimentos/page.tsx`:

```tsx
"use client"
import { useEffect, useState } from "react"

type Dep = { id: number; nome: string; cargo: string; texto: string; ativo: number }

export default function AdminDepoimentos() {
  const [deps, setDeps] = useState<Dep[]>([])
  const [form, setForm] = useState({ nome: "", cargo: "", texto: "", ativo: 1 })
  const [msg, setMsg] = useState("")

  useEffect(() => {
    fetch("/api/depoimentos?todos=1").then(r => r.json()).then(setDeps)
  }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const novo = await fetch("/api/depoimentos", {
      method: "POST",
      body: JSON.stringify(form),
      headers: { "Content-Type": "application/json" },
    }).then(r => r.json())
    setDeps(d => [...d, novo])
    setForm({ nome: "", cargo: "", texto: "", ativo: 1 })
    setMsg("Depoimento adicionado!")
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
        <div className="bg-white rounded-xl border border-border p-6 self-start">
          <h2 className="font-semibold mb-4">Novo Depoimento</h2>
          <form onSubmit={handleAdd} className="flex flex-col gap-3">
            <input placeholder="Nome *" required value={form.nome}
              onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
              className="border border-border rounded-lg px-3 py-2 text-sm" />
            <input placeholder="Cargo / Empresa" value={form.cargo}
              onChange={e => setForm(f => ({ ...f, cargo: e.target.value }))}
              className="border border-border rounded-lg px-3 py-2 text-sm" />
            <textarea placeholder="Depoimento *" required rows={4} value={form.texto}
              onChange={e => setForm(f => ({ ...f, texto: e.target.value }))}
              className="border border-border rounded-lg px-3 py-2 text-sm" />
            <button type="submit" className="bg-primary text-white rounded-lg py-2 text-sm font-medium hover:bg-primary-dark">
              Adicionar
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl border border-border p-6">
          <h2 className="font-semibold mb-4">Depoimentos ({deps.length})</h2>
          <div className="flex flex-col gap-3">
            {deps.map(d => (
              <div key={d.id} className="border border-border rounded-lg p-4 flex justify-between gap-4">
                <div>
                  <p className="font-medium text-sm">{d.nome} {d.cargo && <span className="text-text-muted font-normal">· {d.cargo}</span>}</p>
                  <p className="text-sm text-gray-600 mt-1">"{d.texto}"</p>
                </div>
                <button onClick={() => handleDelete(d.id)} className="text-xs text-red-600 hover:underline flex-shrink-0">Excluir</button>
              </div>
            ))}
            {!deps.length && <p className="text-text-muted text-sm text-center py-8">Nenhum depoimento.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
```

Atualize `app/api/depoimentos/route.ts` para suportar `?todos=1` no GET (retorna todos, não só ativos).

- [ ] **10.4 — Testar páginas de conteúdo**

- http://localhost:3000/admin/historia → salvar e verificar na home
- http://localhost:3000/admin/depoimentos → adicionar/excluir

- [ ] **10.5 — Commit**

```bash
git add app/admin/historia/ app/admin/depoimentos/ app/admin/marcas/ app/api/configuracoes/
git commit -m "feat: admin história, depoimentos e marcas"
```

---

## Task 11: Admin — Menus, SEO, Config e Usuários

**Files:**
- Create: `app/admin/menus/page.tsx`
- Create: `app/admin/seo/page.tsx`
- Create: `app/admin/config/page.tsx`
- Create: `app/admin/usuarios/page.tsx`
- Create: `app/api/seo/route.ts`
- Create: `app/api/usuarios/route.ts`

- [ ] **11.1 — API SEO**

Crie `app/api/seo/route.ts`:

```typescript
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-helpers"

export async function GET() {
  const rows = await prisma.seo_paginas.findMany()
  return NextResponse.json(rows)
}

export async function PUT(req: Request) {
  const { error } = await requireAuth()
  if (error) return error
  const body: Array<{ pagina: string; titulo: string; descricao: string; keywords: string; og_imagem: string }> = await req.json()
  await Promise.all(
    body.map(row =>
      prisma.seo_paginas.upsert({
        where: { pagina: row.pagina },
        update: row,
        create: row,
      })
    )
  )
  return NextResponse.json({ ok: true })
}
```

- [ ] **11.2 — Admin SEO**

Crie `app/admin/seo/page.tsx`:

```tsx
"use client"
import { useEffect, useState } from "react"

const PAGINAS = [
  { key: "home", label: "Home" },
  { key: "produtos", label: "Produtos" },
  { key: "cartela", label: "Cartela de Cores" },
  { key: "contato", label: "Contato" },
]

type SeoRow = { pagina: string; titulo: string; descricao: string; keywords: string; og_imagem: string }

export default function AdminSeo() {
  const [rows, setRows] = useState<SeoRow[]>(
    PAGINAS.map(p => ({ pagina: p.key, titulo: "", descricao: "", keywords: "", og_imagem: "" }))
  )
  const [msg, setMsg] = useState("")

  useEffect(() => {
    fetch("/api/seo").then(r => r.json()).then((data: SeoRow[]) => {
      setRows(PAGINAS.map(p => data.find(d => d.pagina === p.key) ?? { pagina: p.key, titulo: "", descricao: "", keywords: "", og_imagem: "" }))
    })
  }, [])

  function update(pagina: string, field: keyof SeoRow, value: string) {
    setRows(r => r.map(x => x.pagina === pagina ? { ...x, [field]: value } : x))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    await fetch("/api/seo", { method: "PUT", body: JSON.stringify(rows), headers: { "Content-Type": "application/json" } })
    setMsg("SEO salvo!")
    setTimeout(() => setMsg(""), 3000)
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">SEO por Página</h1>
      {msg && <div className="bg-green-50 text-green-700 px-4 py-2 rounded mb-4 text-sm">✓ {msg}</div>}
      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {PAGINAS.map(p => {
          const row = rows.find(r => r.pagina === p.key)!
          return (
            <div key={p.key} className="bg-white rounded-xl border border-border p-6">
              <h2 className="font-semibold mb-4">{p.label}</h2>
              <div className="flex flex-col gap-3">
                <input placeholder="Título (60 chars)" maxLength={60} value={row.titulo}
                  onChange={e => update(p.key, "titulo", e.target.value)}
                  className="border border-border rounded-lg px-3 py-2 text-sm" />
                <textarea placeholder="Descrição (155 chars)" maxLength={155} rows={2} value={row.descricao}
                  onChange={e => update(p.key, "descricao", e.target.value)}
                  className="border border-border rounded-lg px-3 py-2 text-sm" />
                <input placeholder="Keywords (separadas por vírgula)" value={row.keywords}
                  onChange={e => update(p.key, "keywords", e.target.value)}
                  className="border border-border rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
          )
        })}
        <button type="submit" className="bg-primary text-white rounded-lg py-2.5 text-sm font-medium hover:bg-primary-dark self-start px-8">
          Salvar SEO
        </button>
      </form>
    </div>
  )
}
```

- [ ] **11.3 — Admin Config (WhatsApp e Loja)**

Crie `app/admin/config/page.tsx`:

```tsx
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
    await fetch("/api/configuracoes", {
      method: "PUT",
      body: JSON.stringify({ whatsapp: cfg.whatsapp, loja_url: cfg.loja_url }),
      headers: { "Content-Type": "application/json" },
    })
    setMsg("Configurações salvas!")
    setTimeout(() => setMsg(""), 3000)
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Configurações</h1>
      {msg && <div className="bg-green-50 text-green-700 px-4 py-2 rounded mb-4 text-sm">✓ {msg}</div>}
      <form onSubmit={handleSave} className="bg-white rounded-xl border border-border p-6 flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Número do WhatsApp</label>
          <input type="text" value={cfg.whatsapp ?? ""} onChange={e => setCfg(c => ({ ...c, whatsapp: e.target.value }))}
            placeholder="5531999999999"
            className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
          <p className="text-xs text-text-muted mt-1">Formato internacional sem + (ex: 5531999999999)</p>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">URL da Loja Online</label>
          <input type="url" value={cfg.loja_url ?? ""} onChange={e => setCfg(c => ({ ...c, loja_url: e.target.value }))}
            placeholder="https://loja.alpinolinhas.com.br/"
            className="w-full border border-border rounded-lg px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="bg-primary text-white rounded-lg py-2 text-sm font-medium hover:bg-primary-dark self-start px-6">
          Salvar
        </button>
      </form>
    </div>
  )
}
```

- [ ] **11.4 — Commit**

```bash
git add app/admin/menus/ app/admin/seo/ app/admin/config/ app/admin/usuarios/ app/api/seo/ app/api/usuarios/
git commit -m "feat: admin menus, SEO, configurações e usuários"
```

---

## Task 12: Imagens Públicas + next.config

**Files:**
- Modify: `next.config.ts`
- Action: copiar imagens do projeto PHP para `public/`

- [ ] **12.1 — Configurar next.config para imagens locais**

Edite `next.config.ts`:

```typescript
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.alpinolinhas.com.br",
      },
    ],
  },
}

export default nextConfig
```

- [ ] **12.2 — Copiar imagens do projeto PHP**

No PowerShell:

```powershell
$src = "D:\wampserver\www\alpino\images"
$dst = "D:\wampserver\www\alpino-next\public\images"
Copy-Item -Path $src -Destination $dst -Recurse -Force
```

- [ ] **12.3 — Copiar logo**

```powershell
Copy-Item "D:\wampserver\www\alpino\images\logo.png" "D:\wampserver\www\alpino-next\public\images\logo.png" -Force
```

- [ ] **12.4 — Verificar imagens na home**

```bash
npm run dev
```

Acesse http://localhost:3000 — banners, logo e marcas devem aparecer corretamente.

- [ ] **12.5 — Commit**

```bash
git add next.config.ts public/
git commit -m "feat: imagens públicas copiadas e next.config configurado"
```

---

## Task 13: Deploy na Vercel

- [ ] **13.1 — Criar repositório no GitHub**

Acesse github.com → New Repository → nome `alpino-next` → Create.

```bash
git remote add origin https://github.com/SEU_USUARIO/alpino-next.git
git push -u origin main
```

- [ ] **13.2 — Importar projeto na Vercel**

1. Acesse vercel.com → New Project
2. Selecione o repositório `alpino-next`
3. Framework: Next.js (detectado automaticamente)
4. Clique em **Deploy**

- [ ] **13.3 — Configurar variáveis de ambiente na Vercel**

No dashboard do projeto → Settings → Environment Variables, adicione:

```
DATABASE_URL = mysql://USUARIO:SENHA@HOSTNAME:3306/NOME_DO_BANCO
NEXTAUTH_SECRET = [mesmo valor do .env.local]
NEXTAUTH_URL = https://alpino-next.vercel.app
```

- [ ] **13.4 — Habilitar Remote MySQL no cPanel**

1. Acesse cPanel da Task Hosting → **Remote MySQL**
2. Adicione o hostname de saída da Vercel: `%.vercel-infrastructure.com` (ou `%` para liberar qualquer IP)
3. Salve

- [ ] **13.5 — Redeploy e testar**

Na Vercel → Deployments → Redeploy (após adicionar as variáveis).

Acesse `https://alpino-next.vercel.app` e verifique:
- Home carrega com dados do banco
- Login em `/login` funciona
- Admin em `/admin` está protegido

- [ ] **13.6 — Apontar domínio**

Na Vercel → Settings → Domains → Add Domain → `alpinolinhas.com.br`

No cPanel da Task Hosting → Zone Editor → altere o registro A de `alpinolinhas.com.br` para o IP fornecido pela Vercel (ou use CNAME para `cname.vercel-dns.com`).

---

## Decisões Pendentes

- **Upload no Vercel:** O sistema de arquivos da Vercel é somente leitura em produção. Para uploads (banners, produtos, marcas) em produção, use **Vercel Blob** (`@vercel/blob`) no lugar de `writeFile`. O plano gratuito inclui 1GB. A Task 9 usa `writeFile` que funciona localmente — antes do deploy, migrar as rotas de upload para Vercel Blob.
- **Página Cartela:** Implementar após confirmar se é PDF, imagem ou página dinâmica.
- **Admin Menus e Usuários:** Páginas com CRUD completo seguem o mesmo padrão de Depoimentos (Task 10) — formulário + lista com fetch para a API.
