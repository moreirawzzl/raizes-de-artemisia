import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { ConversationsManager } from "@/components/admin/ConversationsManager";

export default async function ConversasPage() {
  await requireAdmin();

  const rawConversations = await prisma.message.findMany({
    distinct: ["conversationUserId"],
    orderBy: { createdAt: "desc" },
    include: {
      conversationUser: { select: { id: true, username: true, email: true } }
    }
  });

  const conversations = await Promise.all(
    rawConversations.map(async (msg) => {
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
        lastMessageAt: msg.createdAt.toISOString(),
        unreadCount
      };
    })
  );

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl text-verde-principal">Conversas</h1>
      <ConversationsManager initialConversations={conversations} />
    </div>
  );
}
