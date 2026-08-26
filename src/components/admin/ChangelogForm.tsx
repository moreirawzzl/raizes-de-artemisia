"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useSettings } from "@/components/providers/SettingsProvider";

interface Changelog {
  id: string;
  title: string;
  description: string;
  version: string;
  highlighted: boolean;
  createdAt: string;
  admin: { username: string };
}

export function ChangelogForm({ changelog, onSuccess }: { changelog?: Changelog; onSuccess: () => void }) {
  const [title, setTitle] = useState(changelog?.title || "");
  const [description, setDescription] = useState(changelog?.description || "");
  const [version, setVersion] = useState(changelog?.version || "");
  const [highlighted, setHighlighted] = useState(changelog?.highlighted || false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { playSound } = useSettings();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !version.trim()) {
      setError("Todos os campos são obrigatórios");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const method = changelog ? "PATCH" : "POST";
      const endpoint = changelog ? `/api/admin/changelog/${changelog.id}` : "/api/admin/changelog";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, version, highlighted })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao salvar");
      }

      playSound("success");
      setTitle("");
      setDescription("");
      setVersion("");
      setHighlighted(false);
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      setError(message);
      playSound("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl2 border border-bege-claro bg-white p-5">
      <div>
        <label className="block text-xs uppercase tracking-widest text-verde-secundario mb-1">Título</label>
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Nova página de chat"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-verde-secundario mb-1">Versão</label>
        <Input
          type="text"
          value={version}
          onChange={(e) => setVersion(e.target.value)}
          placeholder="Ex: v2.1.0"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-verde-secundario mb-1">Descrição</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descreva a novidade..."
          className="w-full rounded-lg border border-bege-claro bg-fundo px-3 py-2 text-sm text-verde-principal outline-none focus:border-verde-secundario"
          rows={4}
          disabled={loading}
        />
      </div>

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={highlighted}
          onChange={(e) => setHighlighted(e.target.checked)}
          disabled={loading}
          className="rounded"
        />
        <span className="text-sm text-verde-principal">Destaque esta novidade</span>
      </label>

      {error && <p className="text-xs text-[#8a4a3a]">{error}</p>}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Salvando..." : changelog ? "Atualizar" : "Criar Novidade"}
      </Button>
    </form>
  );
}
