"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useSettings } from "@/components/providers/SettingsProvider";

interface Coupon {
  id: string;
  code: string;
  percentage: number;
  validUntil: string;
  active: boolean;
  createdAt: string;
}

function defaultValidUntil() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

export function CouponManager({ initialCoupons }: { initialCoupons: Coupon[] }) {
  const router = useRouter();
  const { playSound } = useSettings();
  const [coupons, setCoupons] = useState(initialCoupons);
  const [code, setCode] = useState("");
  const [percentage, setPercentage] = useState(10);
  const [validUntil, setValidUntil] = useState(defaultValidUntil());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createCoupon(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch("/api/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, percentage, validUntil: new Date(validUntil).toISOString() })
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error); playSound("error"); return; }
    setCoupons((prev) => [data, ...prev]);
    setCode(""); setPercentage(10); setValidUntil(defaultValidUntil());
    playSound("success");
  }

  async function toggleActive(c: Coupon) {
    const res = await fetch(`/api/coupons/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !c.active })
    });
    if (res.ok) {
      setCoupons((prev) => prev.map((x) => (x.id === c.id ? { ...x, active: !x.active } : x)));
    }
  }

  async function deleteCoupon(id: string) {
    if (!confirm("Excluir este cupom?")) return;
    await fetch(`/api/coupons/${id}`, { method: "DELETE" });
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    playSound("success");
    router.refresh();
  }

  const isExpired = (c: Coupon) => new Date(c.validUntil) < new Date();

  return (
    <div className="space-y-6">
      <div className="rounded-xl2 border border-bege-claro bg-white p-6">
        <h2 className="mb-4 font-display text-xl text-verde-principal">Criar novo cupom</h2>
        {error && <div className="mb-4 rounded-lg bg-[#F6E7E1] px-3 py-2 text-xs text-[#8a4a3a]">{error}</div>}
        <form onSubmit={createCoupon} className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label>Código do cupom</Label>
            <Input required value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="ex: RAIZES10" />
          </div>
          <div>
            <Label>Válido até</Label>
            <Input type="date" required value={validUntil} onChange={(e) => setValidUntil(e.target.value)} min={new Date().toISOString().slice(0, 10)} />
          </div>
          <div className="sm:col-span-2">
            <Label>Porcentagem de desconto: <span className="font-display text-lg text-verde-principal">{percentage}%</span></Label>
            <input
              type="range"
              min={1}
              max={100}
              value={percentage}
              onChange={(e) => setPercentage(Number(e.target.value))}
              className="w-full accent-[#556B4F]"
            />
            <div className="mt-1 flex justify-between text-[10px] text-bege-escuro">
              <span>1%</span><span>50%</span><span>100%</span>
            </div>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={saving}>{saving ? "Criando..." : "Criar cupom"}</Button>
          </div>
        </form>
      </div>

      <div className="rounded-xl2 border border-bege-claro bg-white p-6">
        <h2 className="mb-4 font-display text-xl text-verde-principal">Cupons cadastrados</h2>
        {coupons.length === 0 ? (
          <p className="text-sm text-verde-secundario">Nenhum cupom criado ainda.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bege-claro text-left text-[10.5px] uppercase tracking-wide text-verde-secundario">
                <th className="p-2">Código</th>
                <th className="p-2">Desconto</th>
                <th className="p-2">Válido até</th>
                <th className="p-2">Status</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className="border-b border-[#f0ece0]">
                  <td className="p-2 font-semibold">{c.code}</td>
                  <td className="p-2">{c.percentage}%</td>
                  <td className="p-2">{new Date(c.validUntil).toLocaleDateString("pt-BR")}</td>
                  <td className="p-2">
                    {isExpired(c) ? (
                      <span className="text-[11px] text-[#8a4a3a]">expirado</span>
                    ) : c.active ? (
                      <span className="text-[11px] text-verde-principal">ativo</span>
                    ) : (
                      <span className="text-[11px] text-bege-escuro">desativado</span>
                    )}
                  </td>
                  <td className="p-2 text-right">
                    <button onClick={() => toggleActive(c)} className="mr-3 text-xs text-verde-secundario underline">
                      {c.active ? "desativar" : "ativar"}
                    </button>
                    <button onClick={() => deleteCoupon(c.id)} className="text-xs text-[#8a4a3a] underline">excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
