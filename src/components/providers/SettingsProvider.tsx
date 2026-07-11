"use client";
import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { playSoundRaw, SoundName } from "@/lib/sound";

interface SettingsState {
  theme: "light" | "dark";
  fontSize: "small" | "medium" | "large";
  soundEnabled: boolean;
  animationsEnabled: boolean;
}

interface SettingsContextValue extends SettingsState {
  playSound: (name: SoundName) => void;
  updateSettings: (patch: Partial<SettingsState>) => Promise<void>;
}

const defaults: SettingsState = { theme: "light", fontSize: "medium", soundEnabled: true, animationsEnabled: true };

const SettingsContext = createContext<SettingsContextValue>({
  ...defaults,
  playSound: () => {},
  updateSettings: async () => {}
});

export function useSettings() {
  return useContext(SettingsContext);
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { data: session, update } = useSession();
  const [state, setState] = useState<SettingsState>(defaults);
  const hydratedForUserId = useRef<string | null>(null);

  // Só sincroniza a partir da sessão UMA VEZ por usuário logado (na primeira
  // vez que os dados dele chegam). Depois disso, quem manda é o clique do
  // usuário — a sessão nunca mais sobrescreve uma escolha feita na tela.
  useEffect(() => {
    const u = session?.user as any;
    if (u?.id) {
      if (hydratedForUserId.current !== u.id) {
        setState({
          theme: u.theme ?? "light",
          fontSize: u.fontSize ?? "medium",
          soundEnabled: u.soundEnabled ?? true,
          animationsEnabled: u.animationsEnabled ?? true
        });
        hydratedForUserId.current = u.id;
      }
    } else if (!u) {
      hydratedForUserId.current = null;
      try {
        const raw = localStorage.getItem("ra_guest_settings");
        if (raw) setState({ ...defaults, ...JSON.parse(raw) });
      } catch {}
    }
  }, [session]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", state.theme);
    root.setAttribute("data-font-size", state.fontSize);
    root.classList.toggle("no-animations", !state.animationsEnabled);
  }, [state.theme, state.fontSize, state.animationsEnabled]);

  const playSound = useCallback((name: SoundName) => {
    if (state.soundEnabled) playSoundRaw(name);
  }, [state.soundEnabled]);

  const updateSettings = useCallback(async (patch: Partial<SettingsState>) => {
    setState((prev) => ({ ...prev, ...patch }));
    if (session?.user) {
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch)
      });
      // Atualiza a sessão em segundo plano só pra outros lugares do site
      // (ex: avatar no menu) — não afeta mais o estado local acima.
      update();
    } else {
      try {
        const raw = localStorage.getItem("ra_guest_settings");
        const current = raw ? JSON.parse(raw) : {};
        localStorage.setItem("ra_guest_settings", JSON.stringify({ ...current, ...patch }));
      } catch {}
    }
  }, [session, update]);

  return (
    <SettingsContext.Provider value={{ ...state, playSound, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}
