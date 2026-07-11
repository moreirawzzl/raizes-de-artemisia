"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatMoney } from "@/lib/format";
import { Button } from "@/components/ui/Button";

export function AddToCartPanel({ productId, price }: { productId: string; price: string }) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const subtotal = parseFloat(price) * qty;

  async function addToCart() {
    setLoading(true);
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: qty })
    });
    setLoading(false);
    if (res.status === 401) { router.push("/login"); return; }
    router.push("/carrinho");
    router.refresh();
  }

  return (
    <div className="mt-6">
      <div className="mb-4 flex items-center gap-5">
        <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-9 w-9 rounded-full border border-bege-claro bg-fundo text-lg text-verde-principal">−</button>
        <span className="min-w-6 text-center text-lg">{qty}</span>
        <button onClick={() => setQty((q) => q + 1)} className="h-9 w-9 rounded-full border border-bege-claro bg-fundo text-lg text-verde-principal">+</button>
      </div>
      <Button onClick={addToCart} disabled={loading} className="flex w-full items-center justify-between px-5">
        <span>{loading ? "Adicionando..." : "Adicionar ao carrinho"}</span>
        <span>{formatMoney(subtotal)}</span>
      </Button>
    </div>
  );
}
