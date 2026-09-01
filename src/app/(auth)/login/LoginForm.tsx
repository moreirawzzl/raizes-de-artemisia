"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { googleSignIn } from "../actions";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) { 
      if (res.error === "BANNED" || res.error.includes("BANNED")) {
        setError("Sua conta foi suspensa. Entre em contato para mais informações.");
      } else {
        setError("E-mail ou senha incorretos.");
      }
      return; 
    }
    router.push("/loja");
    router.refresh();
  }

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-6 py-10">
      <div className="w-full max-w-[400px] rounded-xl2 border border-bege-claro bg-white p-9 text-center shadow-soft">
        <Image src="/images/monogram.jpg" alt="" width={64} height={64} className="mx-auto mb-1.5" />
        <h1 className="font-display text-3xl text-verde-principal">Bem-vinda de volta</h1>
        <p className="mb-6 mt-1 text-[12px] tracking-[2px] uppercase text-verde-secundario">Raízes de Artemísia</p>

        {params.get("criado") && (
          <div className="mb-4 rounded-lg bg-[#EAF0E6] px-3 py-2 text-xs text-verde-principal">Conta criada! Faça login abaixo.</div>
        )}
        {params.get("senha-redefinida") && (
          <div className="mb-4 rounded-lg bg-[#EAF0E6] px-3 py-2 text-xs text-verde-principal">Senha redefinida! Faça login com a nova senha.</div>
        )}
        {params.get("erro") === "google-desativado" && (
          <div className="mb-4 rounded-lg bg-[#F6E7E1] px-3 py-2 text-xs text-[#8a4a3a]">
            Login com Google está desativado para esta conta. Entre com e-mail e senha.
          </div>
        )}
        {params.get("erro") === "banido" && (
          <div className="mb-4 rounded-lg bg-[#F6E7E1] px-3 py-2 text-xs text-[#8a4a3a]">
            Sua conta foi suspensa. Entre em contato para mais informações.
          </div>
        )}
        {params.get("error") && (
          <div className="mb-4 rounded-lg bg-[#F6E7E1] px-3 py-2 text-xs text-[#8a4a3a]">
            {params.get("error") === "Configuration"
              ? "Erro de configuração no login com Google. Verifique se as variáveis de ambiente e URIs estão configuradas na Vercel e no Google Cloud."
              : "Erro ao autenticar com Google. Tente novamente."}
          </div>
        )}
        {error && <div className="mb-4 rounded-lg bg-[#F6E7E1] px-3 py-2 text-xs text-[#8a4a3a]">{error}</div>}

        <form action={googleSignIn}>
          <button
            type="submit"
            className="mb-5 flex w-full items-center justify-center gap-2.5 rounded-xl2 border border-bege-claro bg-white px-4 py-3 text-sm text-verde-principal hover:bg-fundo"
          >
            <svg width="17" height="17" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.3 1 7.3 2.7l5.7-5.7C33.5 6.5 29 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 18.9 13 24 13c2.8 0 5.3 1 7.3 2.7l5.7-5.7C33.5 6.5 29 4.5 24 4.5c-7.6 0-14.1 4.3-17.4 10.6z"/><path fill="#4CAF50" d="M24 43.5c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.4-4.6 2.4-7.2 2.4-5.3 0-9.7-3.6-11.3-8.4l-6.5 5C9.8 39.1 16.4 43.5 24 43.5z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.2 5.2C40.9 36 43.5 30.5 43.5 24c0-1.2-.1-2.4-.4-3.5z"/></svg>
            Entrar com Google
          </button>
        </form>

        <div className="mb-5 flex items-center gap-3 text-[10px] uppercase tracking-widest text-bege-escuro">
          <div className="h-px flex-1 bg-bege-claro" /> ou <div className="h-px flex-1 bg-bege-claro" />
        </div>

        <form onSubmit={onSubmit} className="space-y-3.5 text-left">
          <div>
            <Label>E-mail</Label>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label>Senha</Label>
            <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" disabled={loading} className="w-full">{loading ? "Entrando..." : "Entrar"}</Button>
        </form>

        <p className="mt-4 text-[11.5px]">
          <Link href="/esqueci-senha" className="text-verde-secundario underline">Esqueci minha senha</Link>
        </p>

        <p className="mt-5 text-[12.5px] text-verde-secundario">
          Ainda não tem conta? <Link href="/register" className="font-semibold text-verde-principal underline">Criar conta</Link>
        </p>
      </div>
    </div>
  );
}
