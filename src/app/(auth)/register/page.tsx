"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { googleSignIn } from "../actions";
import { passwordStrengthScore } from "@/lib/password";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const score = passwordStrengthScore(form.password);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Erro ao criar conta."); return; }
    router.push("/login?criado=1");
  }

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-6 py-10">
      <div className="w-full max-w-[400px] rounded-xl2 border border-bege-claro bg-white p-9 text-center shadow-soft">
        <Image src="/images/monogram.jpg" alt="" width={64} height={64} className="mx-auto mb-1.5" />
        <h1 className="font-display text-3xl text-verde-principal">Criar conta</h1>
        <p className="mb-6 mt-1 text-[12px] tracking-[2px] uppercase text-verde-secundario">Raízes de Artemísia</p>

        {error && <div className="mb-4 rounded-lg bg-[#F6E7E1] px-3 py-2 text-left text-xs text-[#8a4a3a]">{error}</div>}

        <form action={googleSignIn}>
          <button
            type="submit"
            className="mb-5 flex w-full items-center justify-center gap-2.5 rounded-xl2 border border-bege-claro bg-white px-4 py-3 text-sm text-verde-principal hover:bg-fundo"
          >
            <svg width="17" height="17" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.3 1 7.3 2.7l5.7-5.7C33.5 6.5 29 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 18.9 13 24 13c2.8 0 5.3 1 7.3 2.7l5.7-5.7C33.5 6.5 29 4.5 24 4.5c-7.6 0-14.1 4.3-17.4 10.6z"/><path fill="#4CAF50" d="M24 43.5c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.4-4.6 2.4-7.2 2.4-5.3 0-9.7-3.6-11.3-8.4l-6.5 5C9.8 39.1 16.4 43.5 24 43.5z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.2 5.2C40.9 36 43.5 30.5 43.5 24c0-1.2-.1-2.4-.4-3.5z"/></svg>
            Cadastrar com Google
          </button>
        </form>

        <div className="mb-5 flex items-center gap-3 text-[10px] uppercase tracking-widest text-bege-escuro">
          <div className="h-px flex-1 bg-bege-claro" /> ou <div className="h-px flex-1 bg-bege-claro" />
        </div>

        <form onSubmit={onSubmit} className="space-y-3.5 text-left">
          <div>
            <Label>Usuário</Label>
            <Input required minLength={3} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          </div>
          <div>
            <Label>E-mail</Label>
            <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <Label>Senha</Label>
            <Input type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-bege-claro">
              <div
                className="h-full transition-all"
                style={{
                  width: `${(score / 5) * 100}%`,
                  background: score <= 2 ? "#b95c48" : score <= 4 ? "#c79a3d" : "#556B4F"
                }}
              />
            </div>
            <p className="mt-1.5 text-[10.5px] leading-relaxed text-bege-escuro">
              Use 8+ caracteres, maiúscula, minúscula, número e símbolo.
            </p>
          </div>
          <div>
            <Label>Confirmar senha</Label>
            <Input type="password" required value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Criando..." : "Criar minha conta"}
          </Button>
        </form>

        <p className="mt-5 text-[12.5px] text-verde-secundario">
          Já tem conta? <Link href="/login" className="font-semibold text-verde-principal underline">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
