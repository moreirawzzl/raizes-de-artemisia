import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";

// GET — client fetches their own conversation messages
export async function GET() {
  const user = await requireUser();
  const userId = (user as any).id as string;

  const messages = await prisma.message.findMany({
    where: { conversationUserId: userId },
    orderBy: { createdAt: "asc" }
  });

  // Mark admin messages as read
  await prisma.message.updateMany({
    where: { conversationUserId: userId, senderRole: "ADMIN", read: false },
    data: { read: true }
  });

  return NextResponse.json(messages);
}

// POST — client sends a message
export async function POST(req: Request) {
  const user = await requireUser();
  const userId = (user as any).id as string;
  const { body } = await req.json();

  if (!body?.trim()) {
    return NextResponse.json({ error: "Mensagem vazia" }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: {
      conversationUserId: userId,
      senderId: userId,
      senderRole: "USER",
      body: body.trim()
    }
  });

  return NextResponse.json(message, { status: 201 });
}
