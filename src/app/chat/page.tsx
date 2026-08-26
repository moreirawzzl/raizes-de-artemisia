import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { ChatWindow } from "@/components/chat/ChatWindow";

export default async function ChatPage() {
  const user = await requireUser();
  const userId = (user as any).id as string;

  const messages = await prisma.message.findMany({
    where: { conversationUserId: userId },
    orderBy: { createdAt: "asc" }
  });

  // Mark admin messages as read on initial load
  await prisma.message.updateMany({
    where: { conversationUserId: userId, senderRole: "ADMIN", read: false },
    data: { read: true }
  });

   const serialized = messages.map((m) => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
    editedAt: m.editedAt ? m.editedAt.toISOString() : undefined
  }));

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-6 font-display text-3xl text-verde-principal">
        Fale conosco
      </h1>
      <p className="mb-6 text-sm text-bege-escuro">
        Envie uma mensagem e a Artemísia responderá em breve. 🌿
      </p>
      <ChatWindow initialMessages={serialized} />
    </main>
  );
}
