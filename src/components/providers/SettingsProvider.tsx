"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
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

  // Sincroniza com a sessão (que reflete o que está salvo no banco)
  useEffect(() => {
    const u = session?.user as any;
    if (u) {
      setState({
        theme: u.theme ?? "light",
        fontSize: u.fontSize ?? "medium",
        soundEnabled: u.soundEnabled ?? true,
        animationsEnabled: u.animationsEnabled ?? true
      });
    } else {
      // Visitante sem login: usa preferências salvas localmente nesse navegador
      try {
        const raw = localStorage.getItem("ra_guest_settings");
        if (raw) setState({ ...defaults, ...JSON.parse(raw) });
      } catch {}
    }
  }, [session]);

  // Aplica no <html> (tema, tamanho de fonte, e desliga animações via classe)
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
      await update();
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
