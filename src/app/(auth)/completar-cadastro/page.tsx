"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { passwordStrengthScore } from "@/lib/password";

/**
 * Depois do primeiro login com Google, oferece criar uma senha do site
 * (opcional). Sem senha, a conta continua funcionando normalmente — só
 * entra pelo botão "Entrar com Google".
 */
export default function CompletarCadastroPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && (session?.user as any)?.hasPassword) {
      router.push("/loja");
    }
  }, [status, session, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/settings/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword: password })
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Erro ao salvar senha."); return; }
    await update();
    router.push("/loja");
  }

  if (status !== "authenticated") return null;

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-6 py-10">
      <div className="w-full max-w-[400px] rounded-xl2 border border-bege-claro bg-white p-9 text-center shadow-soft">
        {session?.user?.image && (
          <img src={session.user.image} alt="" className="mx-auto mb-3 h-16 w-16 rounded-full object-cover" />
        )}
        <h1 className="font-display text-3xl text-verde-principal">Bem-vinda, {session?.user?.name}!</h1>
        <p className="mb-6 mt-2 text-[13px] leading-relaxed text-verde-secundario">
          Sua conta foi criada com o Google. Se quiser, crie também uma senha —
          assim você pode entrar tanto pelo Google quanto por e-mail e senha.
        </p>

        {error && <div className="mb-4 rounded-lg bg-[#F6E7E1] px-3 py-2 text-left text-xs text-[#8a4a3a]">{error}</div>}

        <form onSubmit={onSubmit} className="space-y-3.5 text-left">
          <div>
            <Label>Criar senha (opcional)</Label>
            <Input type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-bege-claro">
              <div
                className="h-full transition-all"
                style={{
                  width: `${(passwordStrengthScore(password) / 5) * 100}%`,
                  background: passwordStrengthScore(password) <= 2 ? "#b95c48" : passwordStrengthScore(password) <= 4 ? "#c79a3d" : "#556B4F"
                }}
              />
            </div>
            <p className="mt-1.5 text-[10.5px] leading-relaxed text-bege-escuro">
              Use 8+ caracteres, maiúscula, minúscula, número e símbolo.
            </p>
          </div>
          <Button type="submit" disabled={loading || password.length < 8} className="w-full">
            {loading ? "Salvando..." : "Criar senha e continuar"}
          </Button>
        </form>

        <button
          onClick={() => router.push("/loja")}
          className="mt-4 text-[12.5px] text-verde-secundario underline"
        >
          Agora não, continuar sem senha
        </button>
      </div>
    </div>
  );
}
