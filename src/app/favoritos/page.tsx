import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { ProductGrid } from "@/components/store/ProductGrid";

export default async function FavoritosPage() {
  const user = await requireUser();

  const favorites = await prisma.favorite.findMany({
    where: { userId: (user as any).id },
    include: { product: { include: { images: true } } },
    orderBy: { createdAt: "desc" }
  });

  const products = favorites.map((f) => f.product).filter((p) => !p.hidden);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="mb-2 font-display text-4xl text-verde-principal">Seus favoritos</h1>
      <p className="mb-8 text-[12.5px] tracking-[1.5px] uppercase text-verde-secundario">Produtos que você salvou</p>
      <ProductGrid products={products as any} />
    </main>
  );
}
