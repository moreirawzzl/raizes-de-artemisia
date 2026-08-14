import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const { status } = await req.json();

  if (!["AWAITING_PAYMENT", "CONFIRMED", "DELIVERED", "CANCELED"].includes(status)) {
    return NextResponse.json({ error: "Status inválido" }, { status: 400 });
  }

  const existing = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!existing) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });

  const wasCounted = existing.status === "CONFIRMED" || existing.status === "DELIVERED";
  const willBeCounted = status === "CONFIRMED" || status === "DELIVERED";

  const salesUpdates = [];
  if (!wasCounted && willBeCounted) {
    for (const item of existing.items) {
      salesUpdates.push(
        prisma.product.update({ where: { id: item.productId }, data: { salesCount: { increment: item.quantity } } })
      );
    }
    // Só agora (pagamento confirmado) o produto sai do carrinho de verdade.
    const cart = await prisma.cart.findUnique({ where: { userId: existing.userId } });
    if (cart) {
      salesUpdates.push(
        prisma.cartItem.deleteMany({
          where: { cartId: cart.id, productId: { in: existing.items.map((i) => i.productId) } }
        })
      );
    }
  } else if (wasCounted && !willBeCounted) {
    for (const item of existing.items) {
      salesUpdates.push(
        prisma.product.update({ where: { id: item.productId }, data: { salesCount: { decrement: item.quantity } } })
      );
    }
  }

  const [order] = await prisma.$transaction([
    prisma.order.update({
      where: { id },
      data: { status, confirmedAt: willBeCounted ? new Date() : null }
    }),
    ...salesUpdates
  ]);

  return NextResponse.json(order);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const existing = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!existing) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });

  const wasCounted = existing.status === "CONFIRMED" || existing.status === "DELIVERED";
  const salesUpdates = wasCounted
    ? existing.items.map((item) =>
        prisma.product.update({ where: { id: item.productId }, data: { salesCount: { decrement: item.quantity } } })
      )
    : [];

  await prisma.$transaction([...salesUpdates, prisma.order.delete({ where: { id } })]);

  return NextResponse.json({ ok: true });
}