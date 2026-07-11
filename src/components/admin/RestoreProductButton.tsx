"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function RestoreProductButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onRestore() {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hidden: false })
      });
      if (!res.ok) {
        alert("Não foi possível reativar o produto.");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={onRestore} disabled={loading} className="text-xs text-verde-secundario underline disabled:opacity-50">
      {loading ? "reativando..." : "reativar"}
    </button>
  );
}
