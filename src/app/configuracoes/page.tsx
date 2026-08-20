"use client";
import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSettings } from "@/components/providers/SettingsProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Label } from "@/components/ui/Label";

function SegButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-xs transition-colors ${
        active ? "border-verde-principal bg-verde-principal text-white" : "border-bege-claro bg-white text-verde-secundario"
      }`}
    >
      {children}
    </button>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition-colors ${checked ? "bg-verde-principal" : "bg-bege-claro"}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}

export default function ConfiguracoesPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const { theme, fontSize, soundEnabled, animationsEnabled, playSound, updateSettings } = useSettings();
  const fileRef = useRef<HTMLInputElement>(null);

  const user = session?.user as any;
  const hasPassword = user?.hasPassword;

  const [username, setUsername] = useState(user?.username || "");
  const [savingUsername, setSavingUsername] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwMsg, setPwMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [savingPw, setSavingPw] = useState(false);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append("files", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    setUploadingAvatar(false);
    if (data.urls?.[0]) {
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: data.urls[0] })
      });
      await update();
      playSound("success");
    }
  }

  async function handleUsernameSave() {
    if (!username.trim() || username.trim().length < 3) return;
    setSavingUsername(true);
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username.trim() })
    });
    setSavingUsername(false);
    if (res.ok) { await update(); playSound("success"); }
    else playSound("error");
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSavingPw(true);
    setPwMsg(null);
    const res = await fetch("/api/settings/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    const data = await res.json();
    setSavingPw(false);
    if (!res.ok) {
      setPwMsg({ type: "err", text: data.error || "Erro ao salvar." });
      playSound("error");
      return;
    }
    setPwMsg({ type: "ok", text: hasPassword ? "Senha atualizada!" : "Senha criada!" });
    setCurrentPassword(""); setNewPassword("");
    await update();
    playSound("success");
  }

  if (!session) {
    return <main className="mx-auto max-w-2xl px-6 py-16 text-center text-verde-secundario">Faça login para acessar as configurações.</main>;
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="mb-8 font-display text-4xl text-verde-principal">Configurações</h1>

      {/* Perfil / avatar / nome */}
      <section className="mb-8 rounded-xl2 border border-bege-claro bg-white p-6">
        <h2 className="mb-4 font-display text-xl text-verde-principal">Foto de perfil</h2>
        <div className="flex items-center gap-4">
          <img
            src={user?.avatarUrl || user?.image || "/images/monogram.jpg"}
            alt=""
            className="h-16 w-16 rounded-full object-cover border border-bege-claro"
          />
          <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploadingAvatar}>
            {uploadingAvatar ? "Enviando..." : "Trocar foto"}
          </Button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>

        <div className="mt-5">
          <Label>Nome de usuário</Label>
          <div className="flex gap-2">
            <Input value={username} onChange={(e) => setUsername(e.target.value)} minLength={3} maxLength={24} />
            <Button type="button" onClick={handleUsernameSave} disabled={savingUsername}>
              {savingUsername ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </section>

      {/* Aparência */}
      <section className="mb-8 rounded-xl2 border border-bege-claro bg-white p-6">
        <h2 className="mb-4 font-display text-xl text-verde-principal">Aparência</h2>

        <div className="mb-5">
          <Label>Tema</Label>
          <div className="flex gap-2">
            <SegButton active={theme === "light"} onClick={() => updateSettings({ theme: "light" })}>☀️ Claro</SegButton>
            <SegButton active={theme === "dark"} onClick={() => updateSettings({ theme: "dark" })}>🌙 Escuro</SegButton>
          </div>
        </div>

        <div>
          <Label>Tamanho da fonte</Label>
          <div className="flex gap-2">
            <SegButton active={fontSize === "small"} onClick={() => updateSettings({ fontSize: "small" })}>Pequena</SegButton>
            <SegButton active={fontSize === "medium"} onClick={() => updateSettings({ fontSize: "medium" })}>Média</SegButton>
            <SegButton active={fontSize === "large"} onClick={() => updateSettings({ fontSize: "large" })}>Grande</SegButton>
          </div>
        </div>
      </section>

      {/* Conforto */}
      <section className="mb-8 rounded-xl2 border border-bege-claro bg-white p-6">
        <h2 className="mb-4 font-display text-xl text-verde-principal">Sons e animações</h2>
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-verde-principal">Sons de interface</span>
          <Toggle checked={soundEnabled} onChange={(v) => updateSettings({ soundEnabled: v })} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-verde-principal">Animações</span>
          <Toggle checked={animationsEnabled} onChange={(v) => updateSettings({ animationsEnabled: v })} />
        </div>
      </section>

      {/* Senha */}
      <section className="mb-8 rounded-xl2 border border-bege-claro bg-white p-6">
        <h2 className="mb-4 font-display text-xl text-verde-principal">{hasPassword ? "Alterar senha" : "Criar senha"}</h2>
        {!hasPassword && (
          <p className="mb-4 text-xs text-verde-secundario">
            Sua conta ainda usa apenas login com Google. Crie uma senha para também poder entrar com e-mail e senha.
          </p>
        )}
        {pwMsg && (
          <div className={`mb-4 rounded-lg px-3 py-2 text-xs ${pwMsg.type === "ok" ? "bg-[#EAF0E6] text-verde-principal" : "bg-[#F6E7E1] text-[#8a4a3a]"}`}>
            {pwMsg.text}
          </div>
        )}
        <form onSubmit={handlePasswordSubmit} className="space-y-3">
          {hasPassword && (
            <div>
              <Label>Senha atual</Label>
              <PasswordInput value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            </div>
          )}
          <div>
            <Label>Nova senha</Label>
            <PasswordInput value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} />
          </div>
          <Button type="submit" disabled={savingPw}>{savingPw ? "Salvando..." : hasPassword ? "Salvar nova senha" : "Criar senha"}</Button>
        </form>
      </section>

      {/* Login com Google */}
      {user?.provider === "google" && (
        <section className="rounded-xl2 border border-bege-claro bg-white p-6">
          <h2 className="mb-4 font-display text-xl text-verde-principal">Login com Google</h2>
          <div className="flex items-center justify-between">
            <span className="text-sm text-verde-principal">Permitir entrar com Google nesta conta</span>
            <Toggle
              checked={user?.allowGoogleLogin ?? true}
              onChange={async (v) => {
                await fetch("/api/settings", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ allowGoogleLogin: v })
                });
                await update();
                playSound(v ? "success" : "toggle");
              }}
            />
          </div>
        </section>
      )}
    </main>
  );
}