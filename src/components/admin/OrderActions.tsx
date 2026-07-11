"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function OrderActions({ orderId, status }: { orderId: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateStatus(newStatus: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Erro ao atualizar pedido");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (status === "PAID") {
    return (
      <button
        disabled={loading}
        onClick={() => updateStatus("AWAITING_PAYMENT")}
        className="rounded-lg border border-bege-escuro px-3 py-1.5 text-xs text-bege-escuro hover:bg-fundo disabled:opacity-50"
      >
        Desfazer confirmação
      </button>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        disabled={loading}
        onClick={() => updateStatus("PAID")}
        className="rounded-lg bg-verde-principal px-3 py-1.5 text-xs text-white hover:bg-[#455a40] disabled:opacity-50"
      >
        Confirmar pagamento
      </button>
      <button
        disabled={loading}
        onClick={() => updateStatus("CANCELED")}
        className="rounded-lg border border-red-300 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 disabled:opacity-50"
      >
        Cancelar
      </button>
    </div>
  );
}
