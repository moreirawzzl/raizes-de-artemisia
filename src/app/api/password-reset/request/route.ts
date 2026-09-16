import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendResetCodeEmail } from "@/lib/mail";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email || typeof email !== "string") return NextResponse.json({ error: "E-mail inválido" }, { status: 400 });

  // Trava o mesmo e-mail de ser bombardeado com pedidos de código.
  const limit = await checkRateLimit(`reset-request:${email.toLowerCase()}`, 3, 15 * 60);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Muitos pedidos de código. Aguarde alguns minutos." }, { status: 429 });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Não revela se o e-mail existe ou não, por segurança.
  if (!user) return NextResponse.json({ ok: true, emailed: true });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.passwordResetCode.create({
    data: { userId: user.id, code, expiresAt }
  });

  const emailed = await sendResetCodeEmail(user.email, code);

  if (process.env.NODE_ENV === "development" && !emailed) {
    console.log(`[DEV ONLY] Código de redefinição para ${user.email}: ${code}`);
  }

  return NextResponse.json({ ok: true, emailed });
}
