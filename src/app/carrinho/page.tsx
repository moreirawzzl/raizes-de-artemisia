import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { CartClient } from "@/components/store/CartClient";

export default async function CarrinhoPage() {
  const user = await requireUser();

  const cart = await prisma.cart.findUnique({
    where: { userId: (user as any).id },
    include: { items: { include: { product: { include: { images: true } } } } }
  });

  const items = (cart?.items ?? []).map((i) => ({
    id: i.id,
    productId: i.productId,
    name: i.product.name,
    price: i.product.price.toString(),
    photo: i.product.images[0]?.url || "/images/monogram.jpg",
    quantity: i.quantity
  }));

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="mb-8 font-display text-4xl text-verde-principal">Seu carrinho</h1>
      <CartClient initialItems={items} />
    </main>
  );
}
