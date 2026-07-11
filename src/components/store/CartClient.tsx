"use client";
import { useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useSettings } from "@/components/providers/SettingsProvider";

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: string;
  photo: string;
  quantity: number;
}

export function CartClient({ initialItems }: { initialItems: CartItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());
  const [checkingOut, setCheckingOut] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; percentage: number } | null>(null);
  const [couponMsg, setCouponMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [fallbackWhatsappUrl, setFallbackWhatsappUrl] = useState<string | null>(null);
  const router = useRouter();
  const { playSound } = useSettings();

  const subtotal = useMemo(() => items.reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0), [items]);
  const discount = coupon ? subtotal * (coupon.percentage / 100) : 0;
  const total = Math.max(0, subtotal - discount);
  const isSyncing = syncingIds.size > 0;

  async function updateQty(itemId: string, quantity: number) {
    if (quantity <= 0) return removeItem(itemId);
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, quantity } : i)));
    setSyncingIds((prev) => new Set(prev).add(itemId));
    try {
      await fetch(`/api/cart/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity })
      });
    } finally {
      setSyncingIds((prev) => { const next = new Set(prev); next.delete(itemId); return next; });
    }
  }

  async function removeItem(itemId: string) {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    await fetch(`/api/cart/${itemId}`, { method: "DELETE" });
  }

  async function applyCoupon() {
    setCouponMsg(null);
    const res = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponInput })
    });
    const data = await res.json();
    if (!res.ok || !data.valid) {
      setCoupon(null);
      setCouponMsg({ type: "err", text: data.error || "Cupom inválido" });
      playSound("error");
      return;
    }
    setCoupon({ code: data.code, percentage: data.percentage });
    setCouponMsg({ type: "ok", text: `Cupom aplicado: ${data.percentage}% de desconto` });
    playSound("success");
  }

  async function checkout() {
    if (isSyncing || checkingOut || items.length === 0) return;
    setCheckingOut(true);
    setCheckoutError(null);
    setFallbackWhatsappUrl(null);

    playSound("checkout");
    const win = window.open("about:blank", "_blank");

    let res: Response;
    try {
      res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          couponCode: coupon?.code
        })
      });
    } catch (err) {
      win?.close();
      setCheckingOut(false);
      setCheckoutError("Erro de conexão. Verifique sua internet e tente novamente.");
      playSound("error");
      return;
    }

    const data = await res.json().catch(() => ({}));
    setCheckingOut(false);

    if (res.ok && data.whatsappUrl) {
      let opened = false;
      if (win) {
        try {
          win.location.href = data.whatsappUrl;
          opened = true;
        } catch {
          opened = false;
        }
      }
      if (!opened) {
        const popup = window.open(data.whatsappUrl, "_blank");
        opened = !!popup && !popup.closed;
      }

      setItems([]);
      router.refresh();

      if (!opened) {
        setFallbackWhatsappUrl(data.whatsappUrl);
      }
    } else {
      win?.close();
      playSound("error");
      setCheckoutError(data.error || "Não foi possível finalizar o pedido. Tente novamente.");
    }
  }

  if (items.length === 0) {
    return <p className="rounded-xl2 border border-dashed border-bege-claro py-16 text-center text-sm text-verde-secundario">Seu carrinho está vazio. 🌿</p>;
  }

  return (
    <div>
      <div className="divide-y divide-[#eee6d9]">
        {items.map((item) => {
          const syncing = syncingIds.has(item.id);
          return (
            <div key={item.id} className="flex gap-4 py-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-bege-claro">
                <Image src={item.photo} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-verde-principal">{item.name}</p>
                <p className="text-xs text-verde-secundario">{formatMoney(item.price)} un.</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <button disabled={syncing} onClick={() => updateQty(item.id, item.quantity - 1)} className="h-6 w-6 rounded-full border border-bege-claro bg-white text-xs disabled:opacity-40">−</button>
                  <span className="min-w-4 text-center text-sm">{item.quantity}</span>
                  <button disabled={syncing} onClick={() => updateQty(item.id, item.quantity + 1)} className="h-6 w-6 rounded-full border border-bege-claro bg-white text-xs disabled:opacity-40">+</button>
                  <button onClick={() => removeItem(item.id)} className="ml-3 text-[11px] text-bege-escuro underline">remover</button>
                  {syncing && <span className="text-[10px] text-bege-escuro">salvando...</span>}
                </div>
              </div>
              <div className="self-center text-sm text-verde-principal">{formatMoney(parseFloat(item.price) * item.quantity)}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex gap-2">
        <Input placeholder="Cupom de desconto" value={couponInput} onChange={(e) => setCouponInput(e.target.value.toUpperCase())} />
        <Button type="button" variant="outline" onClick={applyCoupon}>Aplicar</Button>
      </div>
      {couponMsg && (
        <p className={`mt-2 text-xs ${couponMsg.type === "ok" ? "text-verde-principal" : "text-[#8a4a3a]"}`}>{couponMsg.text}</p>
      )}

      <div className="mt-6 space-y-1.5 border-t border-bege-claro pt-5">
        <div className="flex items-center justify-between text-sm text-verde-secundario">
          <span>Subtotal</span><span>{formatMoney(subtotal)}</span>
        </div>
        {coupon && (
          <div className="flex items-center justify-between text-sm text-verde-principal">
            <span>Desconto ({coupon.percentage}%)</span><span>− {formatMoney(discount)}</span>
          </div>
        )}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs uppercase tracking-wide text-verde-secundario">Total</span>
          <span className="font-display text-2xl font-semibold text-verde-principal">{formatMoney(total)}</span>
        </div>
      </div>

      <Button variant="whatsapp" disabled={isSyncing || checkingOut} onClick={checkout} className="mt-5 w-full">
        {checkingOut ? "Redirecionando..." : isSyncing ? "Salvando alterações..." : "Finalizar no WhatsApp"}
      </Button>

      {checkoutError && (
        <p className="mt-3 rounded-lg bg-[#F7E9E4] px-3 py-2 text-center text-xs text-[#8a4a3a]">{checkoutError}</p>
      )}

      {fallbackWhatsappUrl && (
        <div className="mt-3 rounded-lg bg-[#F3E6C8] px-3 py-3 text-center text-xs text-[#8A6D1F]">
          <p className="mb-2">Seu pedido foi registrado! Seu navegador bloqueou a abertura automática do WhatsApp.</p>
          <a href={fallbackWhatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-block rounded-full bg-verde-principal px-5 py-2 text-white">Abrir WhatsApp agora</a>
        </div>
      )}
    </div>
  );
}
