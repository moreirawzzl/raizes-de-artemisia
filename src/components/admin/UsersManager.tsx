"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useSettings } from "@/components/providers/SettingsProvider";

interface UserRow {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

export function UsersManager({ initialUsers }: { initialUsers: UserRow[] }) {
  const [users, setUsers] = useState(initialUsers);
  const { data: session } = useSession();
  const { playSound } = useSettings();

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
  return (
    <div className="rounded-xl2 border border-bege-claro bg-white p-6">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-bege-claro text-left text-[10.5px] uppercase tracking-wide text-verde-secundario">
            <th className="p-2">Usuário</th>
            <th className="p-2">E-mail</th>
            <th className="p-2">Desde</th>
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
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] uppercase ${u.role === "ADMIN" ? "bg-verde-principal text-white" : "bg-fundo text-verde-secundario"}`}>
                  {u.role === "ADMIN" ? "admin" : "cliente"}
                </span>
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}