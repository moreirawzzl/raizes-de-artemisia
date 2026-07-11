"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteProductButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onDelete() {
    if (!confirm("Excluir este produto? Ele deixará de aparecer na loja, mas o histórico de vendas é mantido.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Não foi possível excluir o produto.");
        return;
      }
      router.refresh();
    } catch (err) {
      alert("Erro de conexão ao tentar excluir. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={onDelete} disabled={loading} className="text-xs text-[#8a4a3a] underline disabled:opacity-50">
      {loading ? "excluindo..." : "excluir"}
    </button>
  );
}
