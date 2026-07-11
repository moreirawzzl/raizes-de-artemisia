"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
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
