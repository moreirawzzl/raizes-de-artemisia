"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { formatMoney } from "@/lib/format";
import { useSettings } from "@/components/providers/SettingsProvider";
import { useFavorites } from "@/components/providers/FavoritesProvider";
import { useSession } from "next-auth/react";

interface Props {
  product: {
    id: string;
    slug: string;
    name: string;
    description: string;
    price: string;
    stock: number;
    images: { url: string }[];
  };
}

export function ProductCard({ product }: Props) {
  const { animationsEnabled } = useSettings();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { data: session } = useSession();
  const router = useRouter();
  const photo = product.images[0]?.url || "/images/monogram.jpg";
  const favorited = isFavorite(product.id);

  function handleFavoriteClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!session?.user) { router.push("/login"); return; }
    toggleFavorite(product.id);
  }

  return (
    <Link href={`/produto/${product.slug}`}>
      <motion.div
        whileHover={animationsEnabled ? { y: -5 } : undefined}
        whileTap={animationsEnabled ? { scale: 0.98 } : undefined}
        transition={{ duration: 0.2 }}
        className="group flex flex-col overflow-hidden rounded-xl2 border border-bege-claro bg-white transition-shadow duration-300 hover:shadow-strong"
      >
        <div className="relative aspect-square w-full overflow-hidden bg-bege-claro">
          <Image src={photo} alt={product.name} fill className="object-cover" />

          <button
            onClick={handleFavoriteClick}
            className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-soft backdrop-blur-sm"
            aria-label="Favoritar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={favorited ? "#B95C48" : "none"} stroke={favorited ? "#B95C48" : "#8A9A7B"} strokeWidth="2">
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
            </svg>
          </button>

          {product.stock === 0 ? (
            <span className="absolute left-2.5 top-2.5 rounded-full bg-[#8a4a3a] px-2.5 py-1 text-[10px] uppercase tracking-wide text-white">
              Esgotado
            </span>
          ) : product.stock <= 5 ? (
            <span className="absolute left-2.5 top-2.5 rounded-full bg-[#c79a3d] px-2.5 py-1 text-[10px] uppercase tracking-wide text-white">
              Só {product.stock} unid.
            </span>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col p-4">
          <h3 className="font-display text-lg text-verde-principal">{product.name}</h3>
          <p className="mt-1 line-clamp-2 flex-1 text-[11.5px] text-bege-escuro">{product.description}</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="font-display text-lg font-semibold text-verde-principal">{formatMoney(product.price)}</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-verde-principal text-white">+</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
