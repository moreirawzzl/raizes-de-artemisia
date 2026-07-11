import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function CartIndicator() {
  const user = await getCurrentUser();
  if (!user) return null;

  const cart = await prisma.cart.findUnique({
    where: { userId: (user as any).id },
    include: { items: true }
  });
  const count = cart?.items.reduce((a, i) => a + i.quantity, 0) ?? 0;

  return (
    <Link href="/carrinho" className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-bege-claro">
      🛒
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-verde-principal text-[10px] text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
