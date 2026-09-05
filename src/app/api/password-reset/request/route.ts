import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendResetCodeEmail } from "@/lib/mail";

export async function POST(req: Request) {
  const { email } = await req.json();
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
