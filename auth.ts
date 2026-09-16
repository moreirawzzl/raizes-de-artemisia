import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/password";
import { checkRateLimit } from "@/lib/rate-limit";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 },
  pages: { signIn: "/login", error: "/login" },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "E-mail ou usuário", type: "text" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email: identifier, password } = parsed.data;

        // Rate limit por identificador — trava força bruta de senha sem
        // depender só do IP (que pode ser compartilhado/proxied).
        const limit = await checkRateLimit(`login:${identifier.toLowerCase()}`, 10, 15 * 60);
        if (!limit.allowed) throw new Error("RATE_LIMITED");

        const isEmail = identifier.includes("@");
        const user = await prisma.user.findUnique({
          where: isEmail ? { email: identifier.trim().toLowerCase() } : { username: identifier.trim() }
        });
        if (!user || !user.hasPassword || !user.passwordHash) return null;
        if (user.banned) throw new Error(`BANNED:${encodeURIComponent(user.banReason || "Não especificado")}`);

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
      clientId: process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET || "",
      allowDangerousEmailAccountLinking: true
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        if (account?.provider === "google") {
          const email = user.email;
          if (!email) return false;

          const existing = await prisma.user.findUnique({ where: { email } });
          if (!existing) {
            const baseUsername = (user.name || email.split("@")[0]).replace(/\s+/g, "").toLowerCase();
            let username = baseUsername || "usuario";
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
            return `/banido?motivo=${encodeURIComponent(existing.banReason || "Não especificado")}`;
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
          token.name = dbUser.username;
          token.username = dbUser.username;
          token.role = dbUser.role;
          token.hasPassword = dbUser.hasPassword;
          token.avatarUrl = dbUser.avatarUrl;
          token.theme = dbUser.theme;
          token.fontSize = dbUser.fontSize;
          token.soundEnabled = dbUser.soundEnabled;
          token.animationsEnabled = dbUser.animationsEnabled;
          token.allowGoogleLogin = dbUser.allowGoogleLogin;
          token.emailOptIn = dbUser.emailOptIn;
          token.provider = dbUser.provider;
        }
      }
      if (trigger === "update" && token.id) {
        const dbUser = await prisma.user.findUnique({ where: { id: token.id as string } });
        if (dbUser) {
          token.name = dbUser.username;
          token.username = dbUser.username;
          token.role = dbUser.role;
          token.hasPassword = dbUser.hasPassword;
          token.avatarUrl = dbUser.avatarUrl;
          token.theme = dbUser.theme;
          token.fontSize = dbUser.fontSize;
          token.soundEnabled = dbUser.soundEnabled;
          token.animationsEnabled = dbUser.animationsEnabled;
          token.allowGoogleLogin = dbUser.allowGoogleLogin;
          token.emailOptIn = dbUser.emailOptIn;
          token.provider = dbUser.provider;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        session.user.name = (token.name as string) ?? session.user.name;
        (session.user as any).username = token.username;
        (session.user as any).role = token.role;
        (session.user as any).hasPassword = token.hasPassword;
        (session.user as any).avatarUrl = token.avatarUrl;
        (session.user as any).theme = token.theme ?? "light";
        (session.user as any).fontSize = token.fontSize ?? "medium";
        (session.user as any).soundEnabled = token.soundEnabled ?? true;
        (session.user as any).animationsEnabled = token.animationsEnabled ?? true;
        (session.user as any).allowGoogleLogin = token.allowGoogleLogin ?? true;
        (session.user as any).emailOptIn = token.emailOptIn ?? true;
        (session.user as any).provider = token.provider ?? "credentials";
      }
      return session;
    }
  }
});