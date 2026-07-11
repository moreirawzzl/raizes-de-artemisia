import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { productId, quantity } = await req.json();

  const cart = await prisma.cart.upsert({
    where: { userId: (user as any).id },
    update: {},
    create: { userId: (user as any).id }
  });

  const item = await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    update: { quantity: { increment: quantity } },
    create: { cartId: cart.id, productId, quantity }
  });

  return NextResponse.json(item, { status: 201 });
}
