import { prisma } from "@/lib/prisma";
import { ProductGrid } from "@/components/store/ProductGrid";
import { SearchSortBar } from "@/components/store/SearchSortBar";
import { Prisma } from "@prisma/client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Loja",
  description: "Confira nosso catálogo de banhos de ervas, incensos e produtos artesanais feitos com respeito à natureza."
};

function buildOrderBy(sort?: string): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "preco-asc": return { price: "asc" };
    case "preco-desc": return { price: "desc" };
    case "mais-vendidos": return { salesCount: "desc" };
    case "menos-vendidos": return { salesCount: "asc" };
    case "mais-vistos": return { viewCount: "desc" };
    case "menos-vistos": return { viewCount: "asc" };
    case "mais-recentes": return { createdAt: "desc" };
    case "mais-antigos": return { createdAt: "asc" };
    case "a-z": return { name: "asc" };
    case "z-a": return { name: "desc" };
    default: return { createdAt: "desc" };
  }
}

export default async function LojaPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; sort?: string; tag?: string }>;
}) {
  const { q, sort, tag } = await searchParams;

  const [products, availableTags] = await Promise.all([
    prisma.product.findMany({
      where: {
        hidden: false,
        ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
        ...(tag ? { tags: { some: { name: tag } } } : {})
      },
      include: { images: true, tags: true },
      orderBy: buildOrderBy(sort)
    }),
    prisma.tag.findMany({ orderBy: { name: "asc" } })
  ]);

  return (
    <main className="pb-16">
      <div className="mx-auto max-w-6xl px-6 pt-10 text-center">
        <h1 className="font-display text-4xl text-verde-principal">Nossos produtos</h1>
        <p className="mt-1 text-[12.5px] tracking-[1.5px] uppercase text-verde-secundario">Produção Artesanal</p>
      </div>
      <SearchSortBar availableTags={availableTags} />
      <div className="mx-auto max-w-6xl px-6">
        <p className="mb-4 text-xs text-verde-secundario">
          {products.length} {products.length === 1 ? "produto encontrado" : "produtos encontrados"}
        </p>
        {products.length === 0 && (q || tag) ? (
          <div className="rounded-xl2 border border-dashed border-bege-claro py-16 text-center text-sm text-verde-secundario">
            Nenhum produto encontrado com esses filtros. 🌿
          </div>
        ) : (
          <ProductGrid products={products as any} />
        )}
      </div>
    </main>
  );
}
