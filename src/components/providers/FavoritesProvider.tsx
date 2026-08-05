"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useSettings } from "./SettingsProvider";

interface FavoritesContextValue {
  favoriteIds: Set<string>;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string) => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue>({
  favoriteIds: new Set(),
  isFavorite: () => false,
  toggleFavorite: async () => {}
});

export function useFavorites() {
  return useContext(FavoritesContext);
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const { playSound } = useSettings();
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!session?.user) { setFavoriteIds(new Set()); return; }
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((data) => setFavoriteIds(new Set(data.productIds || [])))
      .catch(() => {});
  }, [session]);

  const isFavorite = useCallback((productId: string) => favoriteIds.has(productId), [favoriteIds]);

  const toggleFavorite = useCallback(async (productId: string) => {
    if (!session?.user) return;
    const wasFavorite = favoriteIds.has(productId);
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      wasFavorite ? next.delete(productId) : next.add(productId);
      return next;
    });
    playSound(wasFavorite ? "toggle" : "add");
    await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId })
    });
  }, [session, favoriteIds, playSound]);

  return (
    <FavoritesContext.Provider value={{ favoriteIds, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}
