"use client";
import { SessionProvider } from "next-auth/react";
import { SettingsProvider } from "./SettingsProvider";
import { GlobalSoundDelegate } from "./GlobalSoundDelegate";
import { FavoritesProvider } from "./FavoritesProvider";
import { HeartbeatProvider } from "./HeartbeatProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <HeartbeatProvider />
      <SettingsProvider>
        <GlobalSoundDelegate />
        <FavoritesProvider>{children}</FavoritesProvider>
      </SettingsProvider>
    </SessionProvider>
  );
}
