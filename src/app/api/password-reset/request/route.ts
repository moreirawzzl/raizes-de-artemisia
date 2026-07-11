import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Gera um código de 6 dígitos para redefinir a senha.
 *
 * ⚠️ TEMPORÁRIO: por enquanto o código volta na própria resposta da API,
 * só para testar o fluxo sem precisar configurar envio de e-mail ainda.
 * Antes de publicar o site de verdade, troque isso por um envio real de
 * e-mail (ex: Resend, Postmark, SendGrid) e REMOVA o campo "code" da
 * resposta abaixo — do jeito que está, qualquer pessoa com o e-mail
 * poderia ver o código.
 */
export async function POST(req: Request) {
  const { email } = await req.json();
  const user = await prisma.user.findUnique({ where: { email } });

  // Não revela se o e-mail existe ou não, por segurança.
  if (!user) return NextResponse.json({ ok: true });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // válido 10 min de verdade

  await prisma.passwordResetCode.create({
    data: { userId: user.id, code, expiresAt }
  });

  return NextResponse.json({ ok: true, devCode: code });
}
