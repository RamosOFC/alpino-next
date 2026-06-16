import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        usuario: { label: "Usuário", type: "text" },
        senha: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.usuario || !credentials?.senha) return null
        const user = await prisma.admin_usuarios.findFirst({
          where: { usuario: credentials.usuario as string },
        })
        if (!user) return null
        const valid = await bcrypt.compare(credentials.senha as string, user.senha)
        if (!valid) return null
        return { id: String(user.id), name: user.usuario, email: null }
      },
    }),
  ],
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
})
