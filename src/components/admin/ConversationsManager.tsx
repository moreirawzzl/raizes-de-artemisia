"use client";
import { useState, useEffect } from "react";
import { ChatWindow } from "@/components/chat/ChatWindow";

interface ConversationUser {
  id: string;
  username: string;
  email: string;
}

interface Conversation {
  userId: string;
  user: ConversationUser;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

interface Message {
  id: string;
  senderRole: string;
  body: string;
  createdAt: string;
  editedAt?: string;
  read: boolean;
}

interface Props {
  initialConversations: Conversation[];
}

export function ConversationsManager({ initialConversations }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(
    initialConversations[0]?.userId ?? null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  async function loadMessages(userId: string) {
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/admin/messages?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
        // Reset unread count locally
        setConversations((prev) =>
          prev.map((c) => (c.userId === userId ? { ...c, unreadCount: 0 } : c))
        );
      }
    } finally {
      setLoadingMessages(false);
    }
  }

  useEffect(() => {
    if (selectedUserId) {
      loadMessages(selectedUserId);
    }
  }, [selectedUserId]);

  // Refresh conversation list every 15s
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch("/api/admin/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-[280px_1fr]">
      {/* Conversation list */}
      <div className="rounded-xl2 border border-bege-claro bg-white overflow-hidden">
        <div className="border-b border-bege-claro px-4 py-3">
          <h2 className="font-display text-lg text-verde-principal">Conversas</h2>
        </div>
        {conversations.length === 0 && (
          <p className="p-4 text-sm text-bege-escuro">Nenhuma conversa ainda.</p>
        )}
        <ul>
          {conversations.map((c) => (
            <li key={c.userId}>
              <button
                onClick={() => setSelectedUserId(c.userId)}
                className={`w-full px-4 py-3 text-left transition-colors hover:bg-fundo border-b border-bege-claro last:border-0 ${
                  selectedUserId === c.userId ? "bg-fundo" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm text-verde-principal truncate">
                    {c.user.username}
                  </span>
                  {c.unreadCount > 0 && (
                    <span className="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-verde-principal text-[10px] text-white">
                      {c.unreadCount}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-[11px] text-bege-escuro truncate">
                  {c.lastMessage}
                </p>
                <p className="mt-0.5 text-[10px] text-bege-escuro">
                  {new Date(c.lastMessageAt).toLocaleString("pt-BR")}
                </p>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Chat area */}
      <div>
        {selectedUserId ? (
          loadingMessages ? (
            <div className="flex h-[520px] items-center justify-center text-sm text-bege-escuro">
              Carregando...
            </div>
          ) : (
            <ChatWindow
              initialMessages={messages}
              isAdmin
              userId={selectedUserId}
            />
          )
        ) : (
          <div className="flex h-[520px] items-center justify-center rounded-xl2 border border-bege-claro bg-white text-sm text-bege-escuro">
            Selecione uma conversa
          </div>
        )}
      </div>
    </div>
  );
}

