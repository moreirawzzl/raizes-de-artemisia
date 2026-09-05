import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function PATCH(req: Request, { params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  
  const body = await req.json().catch(() => ({}));
  const quantity = Number(body.quantity);

  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
    return NextResponse.json({ error: "Quantidade deve ser um número inteiro entre 1 e 99" }, { status: 400 });
  }

  // Verify item belongs to user's cart
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true }
  });

  if (!item) return NextResponse.json({ error: "Item não encontrado" }, { status: 404 });
  if (item.cart.userId !== (user as any).id) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const updated = await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  // Verify item belongs to user's cart
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true }
  });

  if (!item) return NextResponse.json({ error: "Item não encontrado" }, { status: 404 });
  if (item.cart.userId !== (user as any).id) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  await prisma.cartItem.delete({ where: { id: itemId } });
  return NextResponse.json({ ok: true });
}
