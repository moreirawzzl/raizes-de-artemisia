"use client";
import { useState } from "react";
import { useSettings } from "@/components/providers/SettingsProvider";
import { useRouter } from "next/navigation";

export function FactoryResetButton() {
  const { playSound } = useSettings();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleReset() {
    const confirmation = prompt("AVISO: Esta ação é IRREVERSÍVEL. Ela vai APAGAR TODOS os pedidos, custos e estatísticas. Para continuar, digite: APAGAR TUDO");
    if (confirmation !== "APAGAR TUDO") {
      if (confirmation !== null) {
        alert("Texto incorreto. Reset cancelado.");
      }
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/factory-reset", { method: "POST" });
      if (res.ok) {
        playSound("success");
        alert("Sistema resetado com sucesso.");
        router.refresh();
      } else {
        playSound("error");
        alert("Erro ao realizar o reset.");
      }
    } catch (e) {
      playSound("error");
      alert("Erro ao realizar o reset.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleReset}
      disabled={loading}
      className="rounded-xl border border-[#A00] bg-red-50 px-3 py-1.5 text-[11px] font-semibold text-[#A00] hover:bg-red-100 disabled:opacity-50"
    >
      {loading ? "Zerando..." : "Zerar TUDO permanentemente"}
    </button>
  );
}
