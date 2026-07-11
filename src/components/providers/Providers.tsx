"use client";
import { SessionProvider } from "next-auth/react";
import { SettingsProvider } from "./SettingsProvider";
import { GlobalSoundDelegate } from "./GlobalSoundDelegate";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SettingsProvider>
        <GlobalSoundDelegate />
        {children}
      </SettingsProvider>
    </SessionProvider>
  );
}
