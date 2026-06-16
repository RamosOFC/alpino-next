import { auth } from "@/auth"
import { NextResponse } from "next/server"

export async function requireAuth() {
  const session = await auth()
  if (!session) {
    return { error: NextResponse.json({ error: "Não autorizado" }, { status: 401 }) }
  }
  return { session, error: undefined }
}
