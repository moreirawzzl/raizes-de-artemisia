import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { passwordSchema } from "@/lib/password";

export async function POST(req: Request) {
  const { email, code, newPassword } = await req.json();

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
