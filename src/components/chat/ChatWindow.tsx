"use client";
import { useState, useEffect, useRef } from "react";
import { useSettings } from "@/components/providers/SettingsProvider";

interface Message {
  id: string;
  senderRole: string;
  body: string;
  createdAt: string;
  read: boolean;
}

interface ChatWindowProps {
  initialMessages: Message[];
  isAdmin?: boolean;
  userId?: string; // for admin view — conversation user ID
}

export function ChatWindow({ initialMessages, isAdmin = false, userId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { playSound } = useSettings();

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Polling every 10s for new messages
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const url = isAdmin
          ? `/api/admin/messages?userId=${userId}`
          : "/api/messages";
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch {
        // silent fail
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [isAdmin, userId]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || sending) return;
    setSending(true);
    try {
      const url = isAdmin ? "/api/admin/messages" : "/api/messages";
      const payload = isAdmin ? { userId, body } : { body };
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const newMsg = await res.json();
        setMessages((prev) => [...prev, newMsg]);
        setBody("");
        playSound("add");
      }
    } finally {
      setSending(false);
    }
  }

  const myRole = isAdmin ? "ADMIN" : "USER";

  return (
    <div className="flex h-[520px] flex-col rounded-xl2 border border-bege-claro bg-white shadow-sm">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-sm text-bege-escuro py-10">
            Nenhuma mensagem ainda. Diga olá! 🌿
          </p>
        )}
        {messages.map((msg) => {
          const isMine = msg.senderRole === myRole;
          return (
            <div
              key={msg.id}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  isMine
                    ? "bg-verde-principal text-white"
                    : "bg-[#f4f0e8] text-[#3a3a2e]"
                }`}
              >
                {msg.body}
                <div
                  className={`mt-1 text-[10px] opacity-60`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 border-t border-bege-claro p-3"
      >
        <input
          type="text"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Escreva uma mensagem..."
          className="flex-1 rounded-full border border-bege-claro bg-fundo px-4 py-2 text-sm text-verde-principal outline-none focus:border-verde-secundario"
          disabled={sending}
          maxLength={1000}
        />
        <button
          type="submit"
          disabled={sending || !body.trim()}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-verde-principal text-white transition-opacity hover:opacity-80 disabled:opacity-40"
          aria-label="Enviar mensagem"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </form>
    </div>
  );
}
