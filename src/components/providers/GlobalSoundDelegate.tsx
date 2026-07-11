"use client";
import { useEffect } from "react";
import { useSettings } from "./SettingsProvider";

/**
 * Toca um clique leve em qualquer botão/seletor/cartão de produto nativo do
 * site que não use o componente <Button/> (que já toca o próprio som).
 */
export function GlobalSoundDelegate() {
  const { playSound } = useSettings();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const el = (e.target as HTMLElement).closest(
        'button:not([data-snd-handled]), [data-snd-card], input[type="checkbox"], input[type="range"]'
      );
      if (el) playSound(el.hasAttribute("data-snd-card") ? "click" : "click");
    }
    function onChange(e: Event) {
      const el = e.target as HTMLElement;
      if (el.matches("select, input[type=file], input[type=range]")) playSound("toggle");
    }
    document.addEventListener("click", onClick, true);
    document.addEventListener("change", onChange, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("change", onChange, true);
    };
  }, [playSound]);

  return null;
}
