"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSettings } from "@/components/providers/SettingsProvider";

export function ResetAllButton() {
  const router = useRouter();
  const { playSound } = useSettings();
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    if (
      !confirm(
        "Zerar receita bruta E custos de materiais? Isso não apaga pedidos nem histórico — só passa a contar a partir de agora."
      )
    )
      return;
    setLoading(true);
    const res = await fetch("/api/admin/reset-all", { method: "POST" });
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
      className="rounded-full border border-[#5a3a8a] px-4 py-1.5 text-xs text-[#5a3a8a] disabled:opacity-50 hover:bg-[#5a3a8a] hover:text-white transition-colors"
    >
      {loading ? "Zerando..." : "Zerar tudo (receita + custos)"}
    </button>
  );
}
