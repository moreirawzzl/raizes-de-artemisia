import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { sendBroadcastEmail } from "@/lib/mail";

// Helper for delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const { title, body } = await req.json();

    if (!title || !body) {
      return NextResponse.json({ error: "Título e mensagem são obrigatórios" }, { status: 400 });
    }

    const users = await prisma.user.findMany({ select: { id: true, email: true } });

    if (users.length === 0) {
      return NextResponse.json({ success: true, count: 0 });
    }

    // 1. Criar Notifications
    const notifications = users.map(user => ({
      userId: user.id,
      type: "BROADCAST",
      title,
      body,
      link: null,
    }));

    await prisma.notification.createMany({ data: notifications });

    // 2. Enviar emails em série
    let count = 0;
    for (const user of users) {
      const sent = await sendBroadcastEmail(user.email, title, body);
      if (sent) count++;
      await delay(300); // 300ms de intervalo
    }

    return NextResponse.json({ success: true, count });
  } catch (error) {
    console.error("Erro no broadcast:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
