import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/password";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.hasPassword || !user.passwordHash) return null;
        if (user.banned) throw new Error("BANNED");

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.username,
          username: user.username,
          role: user.role,
          image: user.avatarUrl
        };
      }
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
      if (account?.provider === "google") {
        const email = user.email!;
        const existing = await prisma.user.findUnique({ where: { email } });
        if (!existing) {
          const baseUsername = (user.name || email.split("@")[0]).replace(/\s+/g, "").toLowerCase();
          let username = baseUsername;
          let i = 1;
          while (await prisma.user.findUnique({ where: { username } })) {
            username = `${baseUsername}${i++}`;
          }
          await prisma.user.create({
            data: {
              username,
              email,
              avatarUrl: user.image ?? undefined,
              provider: "google",
              hasPassword: false,
              cart: { create: {} }
            }
          });
        } else if (existing.banned) {
          return "/login?erro=banido";
        } else if (!existing.allowGoogleLogin) {
          return "/login?erro=google-desativado";
        } else if (!existing.avatarUrl && user.image) {
          await prisma.user.update({ where: { email }, data: { avatarUrl: user.image } });
        }
      }
      return true;
      } catch (err) {
        console.error("=== ERRO NO SIGNIN DO GOOGLE ===", err);
        return false;
      }
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({ where: { email: user.email! } });
        if (dbUser) {
          await prisma.user.update({
            where: { id: dbUser.id },
            data: { lastLoginAt: new Date() }
          });
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.hasPassword = dbUser.hasPassword;
          token.avatarUrl = dbUser.avatarUrl;
          token.theme = dbUser.theme;
          token.fontSize = dbUser.fontSize;
          token.soundEnabled = dbUser.soundEnabled;
          token.animationsEnabled = dbUser.animationsEnabled;
          token.allowGoogleLogin = dbUser.allowGoogleLogin;
          token.provider = dbUser.provider;
        }
      }
      if (trigger === "update" && token.id) {
        const dbUser = await prisma.user.findUnique({ where: { id: token.id as string } });
        if (dbUser) {
          token.role = dbUser.role;
          token.hasPassword = dbUser.hasPassword;
          token.avatarUrl = dbUser.avatarUrl;
          token.theme = dbUser.theme;
          token.fontSize = dbUser.fontSize;
          token.soundEnabled = dbUser.soundEnabled;
          token.animationsEnabled = dbUser.animationsEnabled;
          token.allowGoogleLogin = dbUser.allowGoogleLogin;
          token.provider = dbUser.provider;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).hasPassword = token.hasPassword;
        (session.user as any).avatarUrl = token.avatarUrl;
        (session.user as any).theme = token.theme ?? "light";
        (session.user as any).fontSize = token.fontSize ?? "medium";
        (session.user as any).soundEnabled = token.soundEnabled ?? true;
        (session.user as any).animationsEnabled = token.animationsEnabled ?? true;
        (session.user as any).allowGoogleLogin = token.allowGoogleLogin ?? true;
        (session.user as any).provider = token.provider ?? "credentials";
      }
      return session;
    }
  },
  secret: process.env.AUTH_SECRET
});