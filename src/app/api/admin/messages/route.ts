import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { getCurrentUser } from "@/lib/auth-helpers";

// GET — admin fetches messages for a specific user
export async function GET(req: Request) {
  await requireAdmin();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId obrigatório" }, { status: 400 });
  }

  const messages = await prisma.message.findMany({
    where: { conversationUserId: userId },
    orderBy: { createdAt: "asc" }
  });

  // Mark user messages as read (from admin's perspective)
  await prisma.message.updateMany({
    where: { conversationUserId: userId, senderRole: "USER", read: false },
    data: { read: true }
  });

  return NextResponse.json(messages);
}

// POST — admin sends a message to a user
export async function POST(req: Request) {
  const admin = await requireAdmin();
  const adminId = (admin as any).id as string;
  const { userId, body } = await req.json();

  if (!userId || !body?.trim()) {
    return NextResponse.json({ error: "userId e body são obrigatórios" }, { status: 400 });
  }

  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: {
        conversationUserId: userId,
        senderId: adminId,
        senderRole: "ADMIN",
        body: body.trim()
      }
    }),
    prisma.notification.create({
      data: {
        userId,
        type: "ADMIN_MESSAGE",
        title: "A loja te enviou uma mensagem",
        body: body.trim().slice(0, 100),
        link: "/chat"
      }
    })
  ]);

  return NextResponse.json(message, { status: 201 });
}