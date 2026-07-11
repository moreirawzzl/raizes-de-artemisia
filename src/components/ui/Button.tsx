"use client";
import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";
import { useSettings } from "@/components/providers/SettingsProvider";
import { SoundName } from "@/lib/sound";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "whatsapp" | "ghost";
  sound?: SoundName;
}

export function Button({ variant = "primary", sound = "click", className, onClick, ...props }: ButtonProps) {
  const { playSound, animationsEnabled } = useSettings();
  return (
    <button
      onClick={(e) => { playSound(sound); onClick?.(e); }}
      data-snd-handled="1"
      className={clsx(
        "rounded-xl2 px-5 py-3 text-sm tracking-wide transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed",
        animationsEnabled && "active:scale-[0.98]",
        variant === "primary" && "bg-verde-principal text-white hover:bg-[#455a40]",
        variant === "outline" && "border border-verde-principal text-verde-principal hover:bg-verde-principal hover:text-white",
        variant === "whatsapp" && "bg-[#3d8a5f] text-white hover:bg-[#347650]",
        variant === "ghost" && "text-verde-secundario underline hover:text-verde-principal",
        className
      )}
      {...props}
    />
  );
}
