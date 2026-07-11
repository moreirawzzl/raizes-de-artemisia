"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { passwordStrengthScore } from "@/lib/password";

export default function EsqueciSenhaPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "codigo">("email");
  const [email, setEmail] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [showCodeSeconds, setShowCodeSeconds] = useState(10);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (devCode === null) return;
    if (showCodeSeconds <= 0) { setDevCode(null); return; }
    const t = setTimeout(() => setShowCodeSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [devCode, showCodeSeconds]);

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/password-reset/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    setLoading(false);
    setStep("codigo");
    if (data.devCode) { setDevCode(data.devCode); setShowCodeSeconds(10); }
  }

  async function confirmReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/password-reset/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, newPassword })
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Erro ao redefinir senha."); return; }
    router.push("/login?senha-redefinida=1");
  }

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-6 py-10">
      <div className="w-full max-w-[400px] rounded-xl2 border border-bege-claro bg-white p-9 text-center shadow-soft">
        <Image src="/images/monogram.jpg" alt="" width={64} height={64} className="mx-auto mb-1.5" />
        <h1 className="font-display text-3xl text-verde-principal">Esqueci minha senha</h1>
        <p className="mb-6 mt-1 text-[12px] tracking-[2px] uppercase text-verde-secundario">Raízes de Artemísia</p>

        {error && <div className="mb-4 rounded-lg bg-[#F6E7E1] px-3 py-2 text-left text-xs text-[#8a4a3a]">{error}</div>}

        {devCode && (
          <div className="mb-4 rounded-lg bg-[#EAF0E6] px-3 py-3 text-left text-xs text-verde-principal">
            <p className="mb-1 font-semibold">
              Modo de teste — ainda sem envio por e-mail.
            </p>
            <p>
              Seu código: <span className="font-display text-lg tracking-widest">{devCode}</span>
              <span className="ml-2 text-[10px] text-verde-secundario">(some em {showCodeSeconds}s)</span>
            </p>
          </div>
        )}

        {step === "email" ? (
          <form onSubmit={requestCode} className="space-y-3.5 text-left">
            <div>
              <Label>E-mail da conta</Label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Enviando..." : "Gerar código de recuperação"}
            </Button>
          </form>
        ) : (
          <form onSubmit={confirmReset} className="space-y-3.5 text-left">
            <div>
              <Label>Código recebido</Label>
              <Input required maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} placeholder="000000" />
            </div>
            <div>
              <Label>Nova senha</Label>
              <Input type="password" required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-bege-claro">
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${(passwordStrengthScore(newPassword) / 5) * 100}%`,
                    background: passwordStrengthScore(newPassword) <= 2 ? "#b95c48" : passwordStrengthScore(newPassword) <= 4 ? "#c79a3d" : "#556B4F"
                  }}
                />
              </div>
              <p className="mt-1.5 text-[10.5px] leading-relaxed text-bege-escuro">
                Use 8+ caracteres, maiúscula, minúscula, número e símbolo.
              </p>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Redefinindo..." : "Redefinir senha"}
            </Button>
            <button type="button" className="text-[11.5px] text-verde-secundario underline" onClick={() => setStep("email")}>
              Não recebeu? Gerar novo código
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
