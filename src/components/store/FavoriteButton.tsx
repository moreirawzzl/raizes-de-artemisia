"use client";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useFavorites } from "@/components/providers/FavoritesProvider";

export function FavoriteButton({ productId }: { productId: string }) {
  const { data: session } = useSession();
  const { isFavorite, toggleFavorite } = useFavorites();
  const router = useRouter();
  const favorited = isFavorite(productId);

  return (
    <button
      onClick={() => (session?.user ? toggleFavorite(productId) : router.push("/login"))}
      className="mt-3 flex items-center gap-2 text-sm text-verde-secundario"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill={favorited ? "#B95C48" : "none"} stroke={favorited ? "#B95C48" : "#8A9A7B"} strokeWidth="2">
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
      </svg>
      {favorited ? "Nos favoritos" : "Adicionar aos favoritos"}
    </button>
  );
}