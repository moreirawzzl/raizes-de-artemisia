import { prisma } from "@/lib/prisma";
import { ProductGrid } from "@/components/store/ProductGrid";
import { SearchSortBar } from "@/components/store/SearchSortBar";
import { Prisma } from "@prisma/client";

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
  searchParams: Promise<{ q?: string; sort?: string }>;
}) {
  const { q, sort } = await searchParams;

  const products = await prisma.product.findMany({
    where: {
      hidden: false,
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {})
    },
    include: { images: true },
    orderBy: buildOrderBy(sort)
  });

  return (
    <main className="pb-16">
      <div className="mx-auto max-w-6xl px-6 pt-10 text-center">
        <h1 className="font-display text-4xl text-verde-principal">Nossos produtos</h1>
        <p className="mt-1 text-[12.5px] tracking-[1.5px] uppercase text-verde-secundario">Produção Artesanal</p>
      </div>
      <SearchSortBar />
      <div className="mx-auto max-w-6xl px-6">
        <ProductGrid products={products as any} />
      </div>
    </main>
  );
}
