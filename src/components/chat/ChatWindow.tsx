"use client";
import { useState, useEffect, useRef } from "react";
import { useSettings } from "@/components/providers/SettingsProvider";

interface Message {
  id: string;
  senderRole: string;
  body: string;
  createdAt: string;
  editedAt?: string;
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
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
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.error || "Não foi possível enviar a mensagem.");
        playSound("error");
      }
    } catch {
      alert("Erro de conexão ao enviar mensagem.");
      playSound("error");
    } finally {
      setSending(false);
    }
  }

  async function handleEdit(e: React.FormEvent, msgId: string) {
    e.preventDefault();
    if (!editBody.trim() || sending) return;
    setSending(true);
    try {
      const url = isAdmin ? `/api/admin/messages/${msgId}` : `/api/messages/${msgId}`;
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: editBody })
      });
      if (res.ok) {
        const updatedMsg = await res.json();
        setMessages((prev) => prev.map(m => m.id === msgId ? updatedMsg : m));
        setEditingId(null);
        setEditBody("");
        playSound("success");
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Erro ao editar");
        playSound("error");
      }
    } finally {
      setSending(false);
    }
  }

  function startEditing(msg: Message) {
    setEditingId(msg.id);
    setEditBody(msg.body);
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
          const isEditing = editingId === msg.id;
          const fifteenMinsAgo = Date.now() - 15 * 60 * 1000;
          const canEdit = isMine && new Date(msg.createdAt).getTime() > fifteenMinsAgo;

          return (
            <div
              key={msg.id}
              className={`flex group ${isMine ? "justify-end" : "justify-start"}`}
            >
              {isEditing ? (
                <form
                  onSubmit={(e) => handleEdit(e, msg.id)}
                  className="flex w-full max-w-[75%] items-center gap-2 rounded-2xl bg-fundo p-2"
                >
                  <input
                    type="text"
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-verde-principal outline-none"
                    autoFocus
                    maxLength={1000}
                  />
                  <button type="submit" className="text-xs font-medium text-verde-principal hover:underline">Salvar</button>
                  <button type="button" onClick={() => setEditingId(null)} className="text-xs text-bege-escuro hover:underline">Cancelar</button>
                </form>
              ) : (
                <div
                  className={`relative max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    isMine
                      ? "bg-verde-principal text-white"
                      : "bg-[#f4f0e8] text-[#3a3a2e]"
                  }`}
                >
                  {msg.body}
                  <div
                    className={`mt-1 flex items-center justify-between text-[10px] opacity-60`}
                  >
                    <span>
                      {new Date(msg.createdAt).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                      {msg.editedAt && " (editado)"}
                    </span>
                  </div>
                  {canEdit && (
                    <button
                      onClick={() => startEditing(msg)}
                      title="Editar mensagem"
                      aria-label="Editar mensagem"
                      className={`absolute top-1 opacity-0 transition-opacity group-hover:opacity-100 hover:opacity-100 ${
                        isMine ? "-left-9 text-verde-secundario" : "-right-9 text-verde-secundario"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                        <path d="m15 5 4 4" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
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