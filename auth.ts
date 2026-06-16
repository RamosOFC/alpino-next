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
        // Roda bcrypt mesmo quando usuário não existe para evitar timing attack
        const DUMMY = "$2b$12$invalidhashfortimingequalizatio"
        const valid = await bcrypt.compare(credentials.senha as string, user?.senha ?? DUMMY)
        if (!user || !valid) return null
        return { id: String(user.id), name: user.usuario }
      },
    }),
  ],
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
})
