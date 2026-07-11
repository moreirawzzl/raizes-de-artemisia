import NextAuth from "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    role: string
    username: string
  }

  interface Session {
    user: {
      id: string
      role: string
      username: string
      email?: string | null
      name?: string | null
      image?: string | null
    }
  }
}
