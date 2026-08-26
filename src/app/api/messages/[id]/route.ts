import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { moderateMessage } from "@/lib/moderation";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const { body } = await req.json();

    if (!body || typeof body !== "string" || !body.trim()) {
      return NextResponse.json({ error: "Mensagem vazia" }, { status: 400 });
    }

    const message = await prisma.message.findUnique({ where: { id } });
    if (!message) {
      return NextResponse.json({ error: "Mensagem não encontrada" }, { status: 404 });
    }

    // Apenas o autor original pode editar
    if (message.senderId !== user.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    // Limite de 15 minutos
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    if (message.createdAt < fifteenMinutesAgo) {
      return NextResponse.json({ error: "O tempo para editar esta mensagem expirou." }, { status: 403 });
    }

    // Moderação ao editar também
    const moderation = await moderateMessage(body.trim());
    if (moderation.shouldBlock) {
      return NextResponse.json(
        { error: "Sua mensagem não pode ser enviada porque contém conteúdo inadequado." },
        { status: 400 }
      );
    }

    const updated = await prisma.message.update({
      where: { id },
      data: { body: moderation.sanitized, editedAt: new Date() }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao editar mensagem (cliente):", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
