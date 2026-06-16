# Design: Migração Alpino Linhas para Next.js

**Data:** 2026-06-16  
**Status:** Aprovado

---

## Contexto

O site atual da Alpino Linhas (alpinolinhas.com.br) é construído em PHP 8.3 procedural com MySQL 9.1. O painel admin também é PHP. A migração para Next.js mantém o banco de dados MySQL intacto e introduz React no frontend e no admin.

---

## Infraestrutura

```
Vercel (grátis)                  Task Hosting (cPanel)
┌──────────────────────┐         ┌──────────────────────┐
│  Next.js 15          │ ──────▶ │  MySQL (existente)   │
│  App Router          │  Prisma │  Todas as tabelas    │
│  API Routes          │         │  sem mudança         │
│  NextAuth.js (admin) │         └──────────────────────┘
└──────────────────────┘
         ▲
    alpinolinhas.com.br
    (domínio aponta para Vercel)
```

- O banco MySQL permanece no cPanel da Task Hosting sem alterações de schema.
- Remote MySQL é habilitado no cPanel para liberar conexão externa da Vercel.
- O domínio `alpinolinhas.com.br` terá seus DNS apontados para a Vercel após o deploy.
- O projeto PHP atual em `alpino/` é mantido intacto durante o desenvolvimento.

---

## Stack Técnico

| Item | Tecnologia |
|------|-----------|
| Framework | Next.js 15 (App Router) |
| Linguagem | TypeScript |
| Banco | MySQL via Prisma ORM |
| Auth | NextAuth.js v5 (credenciais da tabela `usuarios`) |
| Estilo | Tailwind CSS |
| Deploy | Vercel (plano gratuito) |
| Pasta local | `D:\wampserver\www\alpino-next\` |

---

## Estrutura de Pastas

```
alpino-next/
├── app/
│   ├── (site)/                    ← grupo de rotas públicas (sem prefixo na URL)
│   │   ├── layout.tsx             ← Navbar + Footer compartilhados
│   │   ├── page.tsx               ← Home: banners, slogan, história, marcas, depoimentos
│   │   ├── produtos/
│   │   │   └── page.tsx           ← Catálogo de produtos com filtro por categoria
│   │   └── cartela/
│   │       └── page.tsx           ← Cartela de cores
│   ├── admin/                     ← Painel admin (protegido por NextAuth)
│   │   ├── layout.tsx             ← Sidebar + topbar do admin
│   │   ├── page.tsx               ← Dashboard
│   │   ├── banners/page.tsx
│   │   ├── historia/page.tsx
│   │   ├── depoimentos/page.tsx
│   │   ├── marcas/page.tsx
│   │   ├── categorias/page.tsx
│   │   ├── produtos/page.tsx
│   │   ├── cartelas/page.tsx
│   │   ├── menus/page.tsx
│   │   ├── seo/page.tsx
│   │   ├── config/page.tsx
│   │   └── usuarios/page.tsx
│   ├── api/                       ← API Routes (substituem os .php de dados)
│   │   ├── auth/[...nextauth]/
│   │   │   └── route.ts           ← NextAuth handler
│   │   ├── banners/route.ts
│   │   ├── produtos/route.ts
│   │   ├── categorias/route.ts
│   │   ├── depoimentos/route.ts
│   │   ├── marcas/route.ts
│   │   ├── menus/route.ts
│   │   ├── seo/route.ts
│   │   ├── configuracoes/route.ts
│   │   └── reordenar/route.ts
│   └── login/
│       └── page.tsx               ← Página de login do admin
├── components/
│   ├── site/                      ← Componentes do site público
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── Carousel.tsx
│   │   ├── ProdutoCard.tsx
│   │   └── MarcasMarquee.tsx
│   └── admin/                     ← Componentes do painel admin
│       ├── Sidebar.tsx
│       ├── Topbar.tsx
│       ├── DataTable.tsx
│       └── DropZone.tsx
├── lib/
│   ├── prisma.ts                  ← Singleton do cliente Prisma
│   └── auth.ts                    ← Configuração NextAuth
├── prisma/
│   └── schema.prisma              ← Gerado via `prisma db pull` do MySQL existente
├── public/
│   └── images/                    ← Cópia das imagens do site PHP
├── .env.local                     ← DATABASE_URL, NEXTAUTH_SECRET, etc.
└── next.config.ts
```

---

## Páginas

### Site Público

| Rota | Descrição | Fonte de dados |
|------|-----------|----------------|
| `/` | Home completa: carrossel de banners, slogan, produtos em destaque, história, marcas parceiras, depoimentos, CTA | `banners`, `produtos`, `configuracoes`, `marcas`, `depoimentos` |
| `/produtos` | Catálogo com filtro por categoria/subcategoria | `produtos`, `categorias`, `subcategorias` |
| `/cartela` | Cartela de cores (PDF ou página) | `cartelas` |

### Painel Admin (`/admin/*`)

Todas as páginas equivalentes ao PHP atual, migradas para React. Acesso protegido: qualquer rota `/admin/*` sem sessão redireciona para `/login`.

---

## Autenticação

- NextAuth.js v5 com provider `Credentials`
- Verifica usuário e senha (bcrypt) na tabela `usuarios` do MySQL
- Sessão via JWT armazenado em cookie `httpOnly`
- Middleware Next.js (`middleware.ts`) protege todas as rotas `/admin/*`

---

## API Routes

Cada endpoint segue o padrão REST básico:
- `GET /api/[recurso]` — lista registros
- `POST /api/[recurso]` — cria registro
- `PUT /api/[recurso]` — atualiza registro
- `DELETE /api/[recurso]` — remove registro

Endpoints de admin verificam sessão NextAuth antes de processar. Endpoints públicos (banners, produtos, marcas) são abertos.

---

## Prisma

O schema é gerado automaticamente via:
```bash
npx prisma db pull
```
Isso lê o MySQL existente e cria o `schema.prisma` com todos os models já mapeados. Sem recriar tabelas, sem migração destrutiva.

---

## Estilo

Tailwind CSS replica o visual atual (cores, tipografia, layout). As variáveis CSS do `style.css` atual viram tokens Tailwind em `tailwind.config.ts`. Modo escuro do admin implementado com `dark:` classes do Tailwind.

---

## Ordem de Implementação

1. Scaffold do projeto (`create-next-app`)
2. Prisma + conexão MySQL
3. NextAuth + login + middleware de proteção
4. API Routes (começando pelas de leitura)
5. Site público (Home → Produtos → Cartela)
6. Painel admin (Dashboard → páginas de conteúdo)
7. Upload de imagens (Vercel Blob ou pasta `public/`)
8. Deploy na Vercel + configuração de domínio

---

## Decisões em Aberto

- **Upload de imagens:** Vercel não tem sistema de arquivos persistente. Opções: Vercel Blob (gratuito até 1GB) ou manter uploads no cPanel e servir de lá via URL absoluta.
- **Remote MySQL:** Precisa do acesso ao cPanel da Task Hosting para habilitar e obter as credenciais de conexão externa.
