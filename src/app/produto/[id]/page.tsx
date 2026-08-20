import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatMoney } from "@/lib/format";
import { ProductGrid } from "@/components/store/ProductGrid";
import { AddToCartPanel } from "@/components/store/AddToCartPanel";
import { ViewTracker } from "@/components/store/ViewTracker";
import Image from "next/image";
import { FavoriteButton } from "@/components/store/FavoriteButton";
import { ProductReviews } from "@/components/store/ProductReviews";

export default async function ProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findFirst({
    where: { OR: [{ id }, { slug: id }] },
    include: { images: true, category: true }
  });
  if (!product || product.hidden) notFound();

  const [relacionados, reviews] = await Promise.all([
    prisma.product.findMany({
      where: { hidden: false, id: { not: product.id }, categoryId: product.categoryId ?? undefined },
      include: { images: true },
      take: 4
    }),
    prisma.review.findMany({
      where: { productId: product.id },
      include: { user: { select: { username: true, avatarUrl: true } } },
      orderBy: { createdAt: "desc" }
    })
  ]);

  const avg = reviews.length > 0
    ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length
    : null;

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <ViewTracker productId={product.id} />
      <div className="grid gap-10 md:grid-cols-2 items-start">
        <div className="overflow-hidden rounded-xl2 border border-bege-claro bg-white">
          <div className="relative aspect-[4/3] w-full bg-bege-claro">
            <Image src={product.images[0]?.url || "/images/monogram.jpg"} alt={product.name} fill className="object-cover" />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 p-3">
              {product.images.slice(1).map((img) => (
                <div key={img.id} className="relative h-16 w-16 overflow-hidden rounded-lg bg-bege-claro">
                  <Image src={img.url} alt="" fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="font-display text-4xl text-verde-principal">{product.name}</h1>
          {avg !== null && (
            <div className="mt-1 flex items-center gap-1.5">
              <span className="text-amber-400">{"★".repeat(Math.round(avg))}<span className="text-gray-300">{"★".repeat(5 - Math.round(avg))}</span></span>
              <span className="text-xs text-bege-escuro">{avg.toFixed(1)} ({reviews.length})</span>
            </div>
          )}
          <p className="mt-2 font-display text-2xl font-semibold text-verde-principal">{formatMoney(product.price.toString())}</p>
          <FavoriteButton productId={product.id} />
          <p className="mt-5 text-[11px] uppercase tracking-[2px] text-verde-secundario">Descrição</p>
          <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-[#5c5c50]">{product.description}</p>

          {product.usage && (
            <>
              <p className="mt-5 text-[11px] uppercase tracking-[2px] text-verde-secundario">Modo de uso</p>
              <p className="mt-1.5 text-sm text-[#5c5c50]">{product.usage}</p>
            </>
          )}
          {product.benefits && (
            <>
              <p className="mt-5 text-[11px] uppercase tracking-[2px] text-verde-secundario">Benefícios</p>
              <p className="mt-1.5 text-sm text-[#5c5c50]">{product.benefits}</p>
            </>
          )}
          {product.weight && <p className="mt-3 text-xs text-bege-escuro">Peso: {product.weight}</p>}

          <AddToCartPanel productId={product.id} price={product.price.toString()} />

          <p className="mt-4 text-[10.5px] text-bege-escuro">👁 {product.viewCount} visualizações · {product.salesCount} vendas</p>
        </div>
      </div>

      <ProductReviews
        reviews={reviews.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))}
        avg={avg}
        count={reviews.length}
      />

      {relacionados.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-5 font-display text-2xl text-verde-principal">Você também pode gostar</h2>
          <ProductGrid products={relacionados as any} />
        </section>
      )}
    </main>
  );
}
