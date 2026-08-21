"use client";
import { useState } from "react";
import { useSettings } from "@/components/providers/SettingsProvider";
import { useRouter } from "next/navigation";

const CONFIRM_PHRASE = "APAGAR TUDO";

/**
 * Botão DESTRUTIVO de reset total (factory reset).
 *
 * Fluxo de segurança (ação irreversível — NÃO usa window.confirm/prompt):
 * 1. O botão vermelho "Zerar TUDO permanentemente" abre um painel inline.
 * 2. No painel, o usuário precisa digitar exatamente a frase "APAGAR TUDO".
 * 3. Só com a frase correta o botão final "Confirmar e zerar" é habilitado.
 * 4. Ao confirmar, chama POST /api/admin/factory-reset, toca o som de
 *    sucesso/erro e atualiza a tela.
 */
export function FactoryResetButton() {
  const { playSound } = useSettings();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function openPanel() {
    setTyped("");
    setOpen(true);
    playSound("open");
  }

  function closePanel() {
    setTyped("");
    setOpen(false);
    playSound("close");
  }

  const confirmed = typed === CONFIRM_PHRASE;

  async function handleConfirm() {
    if (!confirmed || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/factory-reset", { method: "POST" });
      if (res.ok) {
        playSound("success");
        alert("Sistema zerado com sucesso. Todos os pedidos, custos e estatísticas foram apagados.");
        setOpen(false);
        setTyped("");
        router.refresh();
      } else {
        playSound("error");
        alert("Erro ao realizar o reset. Tente novamente.");
      }
    } catch (e) {
      playSound("error");
      alert("Erro de conexão ao realizar o reset. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full rounded-xl2 border-2 border-[#A03A2B] bg-[#FBF1EE] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-[#7A2A1E]">Zona de perigo — ação irreversível</p>
          <p className="text-[11px] text-[#A03A2B]">
            Apaga TODOS os pedidos, custos de material e estatísticas. Não há como desfazer.
          </p>
        </div>
        {!open ? (
          <button
            type="button"
            onClick={openPanel}
            disabled={loading}
            className="rounded-xl bg-[#A03A2B] px-4 py-2 text-xs font-bold uppercase tracking-wide text-white shadow-sm transition-colors hover:bg-[#7A2A1E] disabled:opacity-50"
          >
            Zerar TUDO permanentemente
          </button>
        ) : (
          <button
            type="button"
            onClick={closePanel}
            disabled={loading}
            className="rounded-xl border border-[#A03A2B] px-4 py-2 text-xs font-semibold text-[#A03A2B] transition-colors hover:bg-[#A03A2B]/10 disabled:opacity-50"
          >
            Cancelar
          </button>
        )}
      </div>

      {open && (
        <div className="mt-4 rounded-xl border border-[#E3B8AE] bg-white p-4">
          <p className="mb-2 text-xs font-semibold text-[#7A2A1E]">
            Para confirmar a destruição definitiva de todos os dados, digite exatamente a frase:
          </p>
          <p className="mb-3 select-all rounded-lg bg-[#FBF1EE] px-3 py-2 text-center font-mono text-sm font-bold tracking-widest text-[#A03A2B]">
            APAGAR TUDO
          </p>
          <input
            type="text"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            disabled={loading}
            placeholder="Digite APAGAR TUDO aqui..."
            autoFocus
            spellCheck={false}
            className="w-full rounded-xl border border-[#E3B8AE] bg-fundo px-4 py-3 text-sm text-verde-principal outline-none transition-colors placeholder:text-[#C8BDAA] focus:border-[#A03A2B]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && confirmed && !loading) handleConfirm();
            }}
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[11px] text-[#A03A2B]">
              {confirmed ? "Frase correta. O botão de confirmação foi liberado." : "A frase digitada ainda não confere."}
            </p>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!confirmed || loading}
              className="rounded-xl bg-[#7A2A1E] px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white shadow-sm transition-colors hover:bg-[#5E1F16] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? "Zerando..." : "Confirmar e zerar definitivamente"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
