import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";

// GET — list all conversations with unread count
export async function GET() {
  await requireAdmin();

  // Get distinct conversationUserIds with latest message
  const conversations = await prisma.message.findMany({
    distinct: ["conversationUserId"],
    orderBy: { createdAt: "desc" },
    include: {
      conversationUser: { select: { id: true, username: true, email: true } }
    }
  });

  // For each conversation, get unread count (user messages not read by admin)
  const results = await Promise.all(
    conversations.map(async (msg) => {
      const unreadCount = await prisma.message.count({
        where: {
          conversationUserId: msg.conversationUserId,
          senderRole: "USER",
          read: false
        }
      });
      return {
        userId: msg.conversationUserId,
        user: msg.conversationUser,
        lastMessage: msg.body,
        lastMessageAt: msg.createdAt,
        unreadCount
      };
    })
  );

  return NextResponse.json(results);
}
