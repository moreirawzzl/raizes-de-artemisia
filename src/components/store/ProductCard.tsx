"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { formatMoney } from "@/lib/format";
import { useSettings } from "@/components/providers/SettingsProvider";

interface Props {
  product: {
    id: string;
    slug: string;
    name: string;
    description: string;
    price: string;
    images: { url: string }[];
  };
}

export function ProductCard({ product }: Props) {
  const { animationsEnabled } = useSettings();
  const photo = product.images[0]?.url || "/images/monogram.jpg";
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
