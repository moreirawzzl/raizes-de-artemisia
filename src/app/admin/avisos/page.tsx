"use client";
import { useState } from "react";
import { useSettings } from "@/components/providers/SettingsProvider";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";

export default function AdminAvisosPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const { playSound } = useSettings();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!confirm("Isso enviará um e-mail e uma notificação no site para TODOS os clientes cadastrados. Tem certeza?")) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body }),
      });
      const data = await res.json();
      if (res.ok) {
        playSound("success");
        alert(`Aviso enviado com sucesso para ${data.count} usuário(s)!`);
        setTitle("");
        setBody("");
      } else {
        playSound("error");
        alert(data.error || "Erro ao enviar aviso.");
      }
    } catch (error) {
      playSound("error");
      alert("Erro ao enviar aviso.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl text-verde-principal">Avisos (Broadcast)</h1>
      <div className="max-w-2xl rounded-xl2 border border-bege-claro bg-white p-6 shadow-soft">
        <p className="mb-6 text-sm text-verde-secundario">
          Envie um aviso importante para <strong>todos os usuários</strong>. Eles receberão uma notificação no site e um e-mail. Use com moderação.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título do Aviso (Assunto do E-mail)</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Ex: Nova Coleção Primavera"
            />
          </div>
          <div>
            <Label htmlFor="body">Mensagem</Label>
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              className="mt-1.5 min-h-[150px] w-full rounded-xl border border-bege-claro bg-[#FCFAFA] p-3 text-[13.5px] text-verde-principal placeholder-bege-escuro focus:border-verde-principal focus:outline-none focus:ring-1 focus:ring-verde-principal"
              placeholder="Escreva sua mensagem aqui..."
            />
          </div>
          <div className="pt-2">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Enviando..." : "Enviar para todos"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
