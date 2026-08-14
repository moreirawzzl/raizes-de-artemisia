import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, getCurrentUser } from "@/lib/auth-helpers";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await requireAdmin();
  const { id } = await params;
  const { role } = await req.json();

  if (!["USER", "ADMIN"].includes(role)) {
    return NextResponse.json({ error: "Papel inválido" }, { status: 400 });
  }
  if ((me as any).id === id && role === "USER") {
    return NextResponse.json({ error: "Você não pode remover seu próprio acesso de admin" }, { status: 400 });
  }

  const user = await prisma.user.update({ where: { id }, data: { role } });
  return NextResponse.json(user);
}