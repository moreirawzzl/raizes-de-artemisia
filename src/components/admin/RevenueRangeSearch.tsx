"use client";
import { useState } from "react";
import { formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export function RevenueRangeSearch() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [result, setResult] = useState<{ revenue: number; salesCount: number; ordersCount: number } | null>(null);
  const [loading, setLoading] = useState(false);

  async function search() {
    if (!from || !to) return;
    setLoading(true);
    const res = await fetch(`/api/admin/revenue-report?from=${from}&to=${to}`);
    const data = await res.json();
    setLoading(false);
    if (res.ok) setResult(data);
  }

  return (
    <div className="rounded-xl2 border border-bege-claro bg-white p-6">
      <h2 className="mb-4 font-display text-xl text-verde-principal">Consultar receita por período</h2>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <Label>De</Label>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <Label>Até</Label>
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <Button type="button" onClick={search} disabled={loading}>{loading ? "Buscando..." : "Buscar"}</Button>
      </div>

      {result && (
        <div className="mt-5 grid grid-cols-3 gap-4">
          <div className="rounded-xl2 border border-bege-claro bg-fundo p-4">
            <p className="text-[10.5px] uppercase text-verde-secundario">Receita</p>
            <p className="font-display text-2xl text-verde-principal">{formatMoney(result.revenue)}</p>
          </div>
          <div className="rounded-xl2 border border-bege-claro bg-fundo p-4">
            <p className="text-[10.5px] uppercase text-verde-secundario">Itens vendidos</p>
            <p className="font-display text-2xl text-verde-principal">{result.salesCount}</p>
          </div>
          <div className="rounded-xl2 border border-bege-claro bg-fundo p-4">
            <p className="text-[10.5px] uppercase text-verde-secundario">Pedidos</p>
            <p className="font-display text-2xl text-verde-principal">{result.ordersCount}</p>
          </div>
        </div>
      )}
    </div>
  );
}