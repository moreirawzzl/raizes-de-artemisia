import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const { status } = await req.json();

  if (!["AWAITING_PAYMENT", "CONFIRMED", "CANCELED"].includes(status)) {
    return NextResponse.json({ error: "Status inválido" }, { status: 400 });
  }

  const existing = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!existing) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });

  const wasConfirmed = existing.status === "CONFIRMED";
  const willBeConfirmed = status === "CONFIRMED";

  const salesUpdates = [];
  if (!wasConfirmed && willBeConfirmed) {
    for (const item of existing.items) {
      salesUpdates.push(
        prisma.product.update({ where: { id: item.productId }, data: { salesCount: { increment: item.quantity } } })
      );
    }
  } else if (wasConfirmed && !willBeConfirmed) {
    for (const item of existing.items) {
      salesUpdates.push(
        prisma.product.update({ where: { id: item.productId }, data: { salesCount: { decrement: item.quantity } } })
      );
    }
  }

  const [order] = await prisma.$transaction([
    prisma.order.update({
      where: { id },
      data: { status, confirmedAt: willBeConfirmed ? new Date() : null }
    }),
    ...salesUpdates
  ]);

  return NextResponse.json(order);
}
