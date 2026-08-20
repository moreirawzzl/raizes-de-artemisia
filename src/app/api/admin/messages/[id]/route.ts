import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, getCurrentUser } from "@/lib/auth-helpers";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const { body } = await req.json();

    if (!body || typeof body !== "string" || !body.trim()) {
      return NextResponse.json({ error: "Mensagem vazia" }, { status: 400 });
    }

    const message = await prisma.message.findUnique({ where: { id } });
    if (!message) {
      return NextResponse.json({ error: "Mensagem não encontrada" }, { status: 404 });
    }

    // Apenas o autor original (admin que enviou) pode editar
    if (message.senderId !== (admin as any).id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    // Limite de 15 minutos
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    if (message.createdAt < fifteenMinutesAgo) {
      return NextResponse.json({ error: "O tempo para editar esta mensagem expirou." }, { status: 403 });
    }

    const updated = await prisma.message.update({
      where: { id },
      data: { body: body.trim(), editedAt: new Date() }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao editar mensagem (admin):", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
