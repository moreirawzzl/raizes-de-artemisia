"use client";
import { useState, useMemo } from "react";
import { formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useSettings } from "@/components/providers/SettingsProvider";

interface Material {
  id: string;
  description: string;
  amount: number;
  createdAt: string;
}

export function MaterialCalculator({ initialMaterials, grossRevenue }: { initialMaterials: Material[]; grossRevenue: number }) {
  const { playSound } = useSettings();
  const [materials, setMaterials] = useState(initialMaterials);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);

  const totalCost = useMemo(() => materials.reduce((a, m) => a + m.amount, 0), [materials]);
  const netRevenue = grossRevenue - totalCost;
  const margin = grossRevenue > 0 ? (netRevenue / grossRevenue) * 100 : 0;

  async function addMaterial(e: React.FormEvent) {
    e.preventDefault();
    const value = parseFloat(amount.replace(",", "."));
    if (!description.trim() || !(value > 0)) { playSound("error"); return; }
    setSaving(true);
    const res = await fetch("/api/materials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description, amount: value })
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      setMaterials((prev) => [data, ...prev]);
      setDescription(""); setAmount("");
      playSound("success");
    } else {
      playSound("error");
    }
  }

  async function removeMaterial(id: string) {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
    await fetch(`/api/materials/${id}`, { method: "DELETE" });
  }

  return (
    <div className="space-y-6">
      {/* Resumo bruto x líquido */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl2 border border-bege-claro bg-white p-5">
          <p className="text-[11px] uppercase tracking-wide text-verde-secundario">Receita bruta (vendas)</p>
          <p className="mt-1 font-display text-3xl text-verde-principal">{formatMoney(grossRevenue)}</p>
        </div>
        <div className="rounded-xl2 border border-bege-claro bg-white p-5">
          <p className="text-[11px] uppercase tracking-wide text-verde-secundario">Custo de materiais</p>
          <p className="mt-1 font-display text-3xl text-[#8a4a3a]">− {formatMoney(totalCost)}</p>
        </div>
        <div className="rounded-xl2 border border-bege-claro bg-white p-5">
          <p className="text-[11px] uppercase tracking-wide text-verde-secundario">Receita líquida</p>
          <p className="mt-1 font-display text-3xl text-verde-principal">{formatMoney(netRevenue)}</p>
          <p className="mt-1 text-[10.5px] text-bege-escuro">{margin.toFixed(1)}% de margem</p>
        </div>
      </div>

      {/* Lançar custo de material */}
      <div className="rounded-xl2 border border-bege-claro bg-white p-6">
        <h2 className="mb-4 font-display text-xl text-verde-principal">Lançar custo de material</h2>
        <form onSubmit={addMaterial} className="grid gap-4 sm:grid-cols-[1fr_180px_auto]">
          <div>
            <Label>Descrição</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="ex: Frascos de vidro (100un)" />
          </div>
          <div>
            <Label>Valor gasto (R$)</Label>
            <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" inputMode="decimal" />
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={saving}>{saving ? "Salvando..." : "Adicionar"}</Button>
          </div>
        </form>
      </div>

      {/* Lista de custos */}
      <div className="rounded-xl2 border border-bege-claro bg-white p-6">
        <h2 className="mb-4 font-display text-xl text-verde-principal">Custos lançados</h2>
        {materials.length === 0 ? (
          <p className="text-sm text-verde-secundario">Nenhum custo lançado ainda.</p>
        ) : (
          <ul className="divide-y divide-[#f0ece0] text-sm">
            {materials.map((m) => (
              <li key={m.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-verde-principal">{m.description}</p>
                  <p className="text-[10.5px] text-bege-escuro">{new Date(m.createdAt).toLocaleDateString("pt-BR")}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[#8a4a3a]">{formatMoney(m.amount)}</span>
                  <button onClick={() => removeMaterial(m.id)} className="text-[11px] text-bege-escuro underline">remover</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
