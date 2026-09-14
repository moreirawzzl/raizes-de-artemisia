import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

// Chamado periodicamente pelo cliente (ver HeartbeatProvider) enquanto
// o usuário está com o site aberto. Isso é o que alimenta o "online/offline".
export async function POST() {
  const user = await getCurrentUser();
  const userId = (user as any)?.id;
  if (!userId) return NextResponse.json({ ok: false }, { status: 401 });

  // updateMany + where id evita lançar exceção (P2025) se o usuário tiver
  // sido banido/apagado entre o login e essa batida.
  await prisma.user.updateMany({
    where: { id: userId },
    data: { lastSeenAt: new Date() }
  });

  return NextResponse.json({ ok: true });
}
