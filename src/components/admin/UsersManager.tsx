"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSettings } from "@/components/providers/SettingsProvider";
import { isOnline, timeAgo } from "@/lib/format";

interface UserRow {
  id: string;
  username: string;
  email: string;
  role: string;
  banned: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  lastSeenAt: string | null;
}

export function UsersManager({ initialUsers }: { initialUsers: UserRow[] }) {
  const [users, setUsers] = useState(initialUsers);
  const { data: session } = useSession();
  const { playSound } = useSettings();

  // "há X min" e o dot online/offline dependem de Date.now(), então força um
  // re-render a cada 30s pra eles não ficarem parados na tela.
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  async function toggleRole(u: UserRow) {
    const newRole = u.role === "ADMIN" ? "USER" : "ADMIN";
    if (!confirm(`${newRole === "ADMIN" ? "Tornar" : "Remover"} ${u.username} ${newRole === "ADMIN" ? "administradora" : "de administradora"}?`)) return;
    const res = await fetch(`/api/admin/users/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole })
    });
    const data = await res.json();
    if (res.ok) {
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, role: newRole } : x)));
      playSound("success");
    } else {
      alert(data.error || "Erro ao atualizar");
      playSound("error");
    }
  }
async function sendMessage(u: UserRow) {
  const message = prompt(`Mensagem para ${u.username}:`);
  if (!message?.trim()) return;
  const res = await fetch("/api/admin/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: u.id, message })
  });
  if (res.ok) { playSound("success"); alert("Mensagem enviada!"); }
  else playSound("error");
}

  async function deleteUser(u: UserRow) {
    if (!confirm(`Excluir ${u.username} permanentemente? Essa ação não pode ser desfeita.`)) return;
    const res = await fetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
      playSound("success");
    } else {
      alert(data.error || "Erro ao excluir usuário");
      playSound("error");
    }
  }

  async function toggleBan(u: UserRow) {
    const newBanned = !u.banned;
    let reason = "";
    if (newBanned) {
      const input = prompt(`Banir ${u.username} — digite o motivo (obrigatório):`);
      if (input === null) return;
      reason = input.trim();
      if (!reason) {
        alert("O motivo do banimento é obrigatório.");
        return;
      }
    } else {
      if (!confirm(`Deseja desbanir ${u.username}?`)) return;
    }
    
    const res = await fetch(`/api/admin/users/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ banned: newBanned, reason: newBanned ? reason : undefined })
    });
    
    const data = await res.json();
    if (res.ok) {
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, banned: newBanned } : x)));
      playSound("success");
    } else {
      alert(data.error || "Erro ao atualizar");
      playSound("error");
    }
  }
  return (
    <div className="rounded-xl2 border border-bege-claro bg-white p-6">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-bege-claro text-left text-[10.5px] uppercase tracking-wide text-verde-secundario">
            <th className="p-2">Usuário</th>
            <th className="p-2">E-mail</th>
            <th className="p-2">Desde</th>
            <th className="p-2">Status</th>
            <th className="p-2">Papel</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-[#f0ece0]">
              <td className="p-2">{u.username}</td>
              <td className="p-2">{u.email}</td>
              <td className="p-2">{new Date(u.createdAt).toLocaleDateString("pt-BR")}</td>
              <td className="p-2">
                {isOnline(u.lastSeenAt) ? (
                  <span className="flex items-center gap-1.5 text-[11px] text-green-700">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    online
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[11px] text-verde-secundario/70">
                    <span className="h-2 w-2 rounded-full bg-gray-300" />
                    {u.lastSeenAt ? timeAgo(u.lastSeenAt) : u.lastLoginAt ? timeAgo(u.lastLoginAt) : "nunca acessou"}
                  </span>
                )}
              </td>
              <td className="p-2">
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] uppercase ${u.role === "ADMIN" ? "bg-verde-principal text-white" : "bg-fundo text-verde-secundario"}`}>
                  {u.role === "ADMIN" ? "admin" : "cliente"}
                </span>
                {u.banned && (
                  <span className="ml-2 rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] uppercase text-red-600">
                    banido
                  </span>
                )}
              </td>
              <td className="p-2 text-right">
                <button
                  onClick={() => toggleRole(u)}
                  disabled={(session?.user as any)?.id === u.id}
                  className="text-xs text-verde-secundario underline disabled:opacity-30"
                >
                  {u.role === "ADMIN" ? "remover admin" : "tornar admin"}
                </button>
                <button
                  onClick={() => sendMessage(u)}
                  className="ml-3 text-xs text-verde-secundario underline"
                >
                  mandar mensagem
                </button>
                <button
                  onClick={() => toggleBan(u)}
                  disabled={(session?.user as any)?.id === u.id}
                  className="ml-3 text-xs text-[#A00] underline disabled:opacity-30"
                >
                  {u.banned ? "desbanir" : "banir"}
                </button>
                <button
                  onClick={() => deleteUser(u)}
                  disabled={(session?.user as any)?.id === u.id}
                  className="ml-3 text-xs text-[#A00] underline disabled:opacity-30"
                >
                  excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>
    </div>
  );
}