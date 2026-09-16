import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { passwordSchema } from "@/lib/password";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const { email, code, newPassword } = await req.json();
  if (!email || typeof email !== "string") return NextResponse.json({ error: "Código inválido" }, { status: 400 });

  // Sem isso, o código de 6 dígitos (1 em 1 milhão) podia ser forçado à
  // bruta dentro da janela de 10 minutos em que ele é válido.
  const limit = await checkRateLimit(`reset-confirm:${email.toLowerCase()}`, 8, 15 * 60);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Muitas tentativas. Peça um novo código e aguarde alguns minutos." }, { status: 429 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "Código inválido" }, { status: 400 });

  const resetCode = await prisma.passwordResetCode.findFirst({
    where: { userId: user.id, code, used: false },
    orderBy: { createdAt: "desc" }
  });

  if (!resetCode || resetCode.expiresAt < new Date()) {
    return NextResponse.json({ error: "Código inválido ou expirado" }, { status: 400 });
  }

  const parsed = passwordSchema.safeParse(newPassword);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { passwordHash, hasPassword: true } }),
    prisma.passwordResetCode.update({ where: { id: resetCode.id }, data: { used: true } })
  ]);

  return NextResponse.json({ ok: true });
}
