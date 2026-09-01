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
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <ViewTracker productId={product.id} />

      {/* ── Desktop: grid 45/55 · Mobile: stacked ── */}
      <div className="product-detail-grid">

        {/* ── COLUNA ESQUERDA: imagem ── */}
        <div className="product-image-col">
          <div className="product-image-sticky">
            {/* Imagem principal */}
            <div className="product-image-main">
              <Image
                src={product.images[0]?.url || "/images/monogram.jpg"}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 45vw"
                className="object-contain"
                priority
              />
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2 mt-3 justify-center">
                {product.images.slice(1).map((img) => (
                  <div key={img.id} className="relative h-16 w-16 overflow-hidden rounded-lg bg-bege-claro border border-bege-claro">
                    <Image src={img.url} alt="" fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── COLUNA DIREITA: detalhes ── */}
        <div className="product-info-col">
          <h1 className="font-display text-3xl sm:text-4xl text-verde-principal leading-tight">{product.name}</h1>

          {avg !== null && (
            <div className="mt-2 flex items-center gap-1.5">
              <span className="text-amber-400">{"★".repeat(Math.round(avg))}<span className="text-amber-200">{"★".repeat(5 - Math.round(avg))}</span></span>
              <span className="text-xs product-text-muted">{avg.toFixed(1)} ({reviews.length})</span>
            </div>
          )}

          <p className="mt-3 font-display text-2xl sm:text-3xl font-semibold text-verde-principal">{formatMoney(product.price.toString())}</p>

          <FavoriteButton productId={product.id} />

          {/* Separador */}
          <hr className="my-5 border-bege-claro" />

          {/* Descrição */}
          <div className="product-section">
            <p className="product-section-label">Descrição</p>
            <p className="product-section-text whitespace-pre-line">{product.description}</p>
          </div>

          {product.usage && (
            <div className="product-section">
              <p className="product-section-label">Modo de uso</p>
              <p className="product-section-text">{product.usage}</p>
            </div>
          )}

          {product.benefits && (
            <div className="product-section">
              <p className="product-section-label">Benefícios</p>
              <p className="product-section-text">{product.benefits}</p>
            </div>
          )}

          {product.weight && (
            <div className="product-section">
              <p className="product-detail-meta">Peso: {product.weight}</p>
            </div>
          )}

          {/* Separador */}
          <hr className="my-5 border-bege-claro" />

          <AddToCartPanel productId={product.id} price={product.price.toString()} />

          <p className="mt-4 text-[11px] product-text-muted">👁 {product.viewCount} visualizações · {product.salesCount} vendas</p>
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
