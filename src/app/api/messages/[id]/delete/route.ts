import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;

    const message = await prisma.message.findUnique({ where: { id } });
    if (!message) {
      return NextResponse.json({ error: "Mensagem não encontrada" }, { status: 404 });
    }

    // Apenas o autor original ou admin podem deletar
    const isAuthor = message.senderId === user.id;
    const isAdmin = (user as any).role === "ADMIN";

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: "Você não tem permissão para deletar esta mensagem" }, { status: 403 });
    }

    // Deletar também os reports associados
    await prisma.messageReport.deleteMany({ where: { messageId: id } });
    
    // Deletar a mensagem
    await prisma.message.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar mensagem:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
