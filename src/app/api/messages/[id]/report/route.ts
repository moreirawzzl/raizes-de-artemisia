import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const userId = (user as any).id as string;

    const { id } = await params;
    const { reason } = await req.json();

    if (!reason || typeof reason !== "string" || !reason.trim()) {
      return NextResponse.json({ error: "Motivo do report é obrigatório" }, { status: 400 });
    }

    // Verificar se a mensagem existe
    const message = await prisma.message.findUnique({ where: { id } });
    if (!message) {
      return NextResponse.json({ error: "Mensagem não encontrada" }, { status: 404 });
    }

    // Não permitir reportar a própria mensagem
    if (message.senderId === userId) {
      return NextResponse.json({ error: "Você não pode reportar sua própria mensagem" }, { status: 400 });
    }

    // Verificar se já reportou essa mensagem
    const existingReport = await prisma.messageReport.findFirst({
      where: { messageId: id, reporterId: userId }
    });

    if (existingReport) {
      return NextResponse.json({ error: "Você já reportou esta mensagem" }, { status: 400 });
    }

    // Criar o report
    const report = await prisma.messageReport.create({
      data: {
        messageId: id,
        reporterId: userId,
        reason: reason.trim()
      }
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error("Erro ao reportar mensagem:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
