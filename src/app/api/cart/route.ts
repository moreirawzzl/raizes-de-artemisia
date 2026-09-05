import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

import { z } from "zod";

const cartAddSchema = z.object({
  productId: z.string().min(1, "ID do produto inválido"),
  quantity: z.number().int().min(1, "Quantidade mínima é 1").max(99, "Quantidade máxima é 99")
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = cartAddSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { productId, quantity } = parsed.data;

  const product = await prisma.product.findUnique({
    where: { id: productId }
  });

  if (!product || product.hidden || !product.ativo) {
    return NextResponse.json({ error: "Produto indisponível" }, { status: 404 });
  }

  const cart = await prisma.cart.upsert({
    where: { userId: (user as any).id },
    update: {},
    create: { userId: (user as any).id }
  });

  const existingItem = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } }
  });

  const nextQuantity = Math.min(99, (existingItem?.quantity ?? 0) + quantity);

  const item = await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    update: { quantity: nextQuantity },
    create: { cartId: cart.id, productId, quantity: nextQuantity }
  });

  return NextResponse.json(item, { status: 201 });
}
