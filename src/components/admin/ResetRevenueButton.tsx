"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSettings } from "@/components/providers/SettingsProvider";

export function ResetRevenueButton() {
  const router = useRouter();
  const { playSound } = useSettings();
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    if (!confirm("Zerar a receita bruta? Isso não apaga nenhum pedido nem histórico — só passa a contar a receita a partir de agora.")) return;
    setLoading(true);
    const res = await fetch("/api/admin/reset-revenue", { method: "POST" });
    setLoading(false);
    if (res.ok) {
      playSound("success");
      router.refresh();
    } else {
      playSound("error");
    }
  }

  return (
    <button
      onClick={handleReset}
      disabled={loading}
      className="rounded-full border border-[#8a4a3a] px-4 py-1.5 text-xs text-[#8a4a3a] disabled:opacity-50"
    >
      {loading ? "Zerando..." : "Zerar receita bruta"}
    </button>
  );
}
