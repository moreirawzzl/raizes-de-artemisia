import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { passwordSchema } from "@/lib/password";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { currentPassword, newPassword } = await req.json();

  const dbUser = await prisma.user.findUnique({ where: { id: (user as any).id } });
  if (!dbUser) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

  // Se já existe senha cadastrada, a senha atual precisa bater.
  if (dbUser.hasPassword && dbUser.passwordHash) {
    if (!currentPassword) return NextResponse.json({ error: "Informe sua senha atual" }, { status: 400 });
    const valid = await bcrypt.compare(currentPassword, dbUser.passwordHash);
    if (!valid) return NextResponse.json({ error: "Senha atual incorreta" }, { status: 400 });
  }

  const parsed = passwordSchema.safeParse(newPassword);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: dbUser.id },
    data: { passwordHash, hasPassword: true }
  });

  return NextResponse.json({ ok: true });
}
