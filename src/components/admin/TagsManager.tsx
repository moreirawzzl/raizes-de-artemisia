"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useSettings } from "@/components/providers/SettingsProvider";
import { TagBadge } from "@/components/store/TagBadge";

interface Tag {
  id: string;
  name: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

const DEFAULT_FORM = { name: "", bgColor: "#DCCFB9", borderColor: "#8A9A7B", textColor: "#556B4F" };

export function TagsManager({ initialTags }: { initialTags: Tag[] }) {
  const { playSound } = useSettings();
  const [tags, setTags] = useState(initialTags);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEdit(tag: Tag) {
    setEditingId(tag.id);
    setForm({ name: tag.name, bgColor: tag.bgColor, borderColor: tag.borderColor, textColor: tag.textColor });
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(DEFAULT_FORM);
    setError(null);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const url = editingId ? `/api/admin/tags/${editingId}` : "/api/admin/tags";
    const method = editingId ? "PATCH" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error);
      playSound("error");
      return;
    }

    if (editingId) {
      setTags((prev) => prev.map((t) => (t.id === editingId ? data : t)));
    } else {
      setTags((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
    }
    cancelEdit();
    playSound("success");
  }

  async function deleteTag(tag: Tag) {
    if (!confirm(`Excluir a etiqueta "${tag.name}"? Os produtos que a usam não serão apagados, só perdem essa etiqueta.`)) return;
    const res = await fetch(`/api/admin/tags/${tag.id}`, { method: "DELETE" });
    if (res.ok) {
      setTags((prev) => prev.filter((t) => t.id !== tag.id));
      playSound("success");
      if (editingId === tag.id) cancelEdit();
    } else {
      playSound("error");
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl2 border border-bege-claro bg-white p-6">
        <h2 className="mb-4 font-display text-xl text-verde-principal">
          {editingId ? "Editar etiqueta" : "Criar nova etiqueta"}
        </h2>
        {error && <div className="mb-4 rounded-lg bg-[#F6E7E1] px-3 py-2 text-xs text-[#8a4a3a]">{error}</div>}
        <form onSubmit={save} className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Nome</Label>
            <Input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="ex: Promoção" maxLength={30} />
          </div>
          <div>
            <Label>Cor de fundo</Label>
            <div className="flex items-center gap-2">
              <input type="color" value={form.bgColor} onChange={(e) => setForm((f) => ({ ...f, bgColor: e.target.value }))} className="h-9 w-12 cursor-pointer rounded border border-bege-claro" />
              <Input value={form.bgColor} onChange={(e) => setForm((f) => ({ ...f, bgColor: e.target.value }))} className="flex-1" />
            </div>
          </div>
          <div>
            <Label>Cor da borda</Label>
            <div className="flex items-center gap-2">
              <input type="color" value={form.borderColor} onChange={(e) => setForm((f) => ({ ...f, borderColor: e.target.value }))} className="h-9 w-12 cursor-pointer rounded border border-bege-claro" />
              <Input value={form.borderColor} onChange={(e) => setForm((f) => ({ ...f, borderColor: e.target.value }))} className="flex-1" />
            </div>
          </div>
          <div>
            <Label>Cor do texto</Label>
            <div className="flex items-center gap-2">
              <input type="color" value={form.textColor} onChange={(e) => setForm((f) => ({ ...f, textColor: e.target.value }))} className="h-9 w-12 cursor-pointer rounded border border-bege-claro" />
              <Input value={form.textColor} onChange={(e) => setForm((f) => ({ ...f, textColor: e.target.value }))} className="flex-1" />
            </div>
          </div>
          <div className="flex items-end">
            <div>
              <Label>Preview</Label>
              <TagBadge tag={{ name: form.name || "Etiqueta", bgColor: form.bgColor, borderColor: form.borderColor, textColor: form.textColor }} />
            </div>
          </div>
          <div className="flex gap-3 sm:col-span-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Salvando..." : editingId ? "Salvar alterações" : "Criar etiqueta"}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={cancelEdit}>Cancelar</Button>
            )}
          </div>
        </form>
      </div>

      <div className="rounded-xl2 border border-bege-claro bg-white p-6">
        <h2 className="mb-4 font-display text-xl text-verde-principal">Etiquetas cadastradas</h2>
        {tags.length === 0 ? (
          <p className="text-sm text-verde-secundario">Nenhuma etiqueta criada ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-bege-claro text-left text-[10.5px] uppercase tracking-wide text-verde-secundario">
                  <th className="p-2">Preview</th>
                  <th className="p-2">Nome</th>
                  <th className="p-2"></th>
                </tr>
              </thead>
              <tbody>
                {tags.map((t) => (
                  <tr key={t.id} className="border-b border-[#f0ece0]">
                    <td className="p-2"><TagBadge tag={t} /></td>
                    <td className="p-2">{t.name}</td>
                    <td className="p-2 text-right">
                      <button onClick={() => startEdit(t)} className="mr-3 text-xs text-verde-secundario underline">editar</button>
                      <button onClick={() => deleteTag(t)} className="text-xs text-[#8a4a3a] underline">excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
