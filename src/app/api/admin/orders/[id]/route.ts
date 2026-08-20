import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";

const VALID_STATUSES = ["PAID", "AWAITING_PAYMENT", "CANCELED", "DELIVERED"];
const PAID_LIKE = ["PAID", "DELIVERED"];

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const { status } = await req.json();

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });

    // Increment salesCount when transitioning TO a paid-like status FROM a non-paid-like status
    const shouldIncrement = PAID_LIKE.includes(status) && !PAID_LIKE.includes(order.status);
    // Decrement when moving FROM paid-like TO a non-paid-like status
    const shouldDecrement = PAID_LIKE.includes(order.status) && !PAID_LIKE.includes(status);

    // Create delivery notification
    const shouldNotifyDelivery = status === "DELIVERED" && order.status !== "DELIVERED";

    await prisma.$transaction([
      prisma.order.update({ where: { id }, data: { status } }),
      ...(shouldIncrement
        ? order.items.map((i) =>
            prisma.product.update({ where: { id: i.productId }, data: { salesCount: { increment: i.quantity } } })
          )
        : []),
      ...(shouldDecrement
        ? order.items.map((i) =>
            prisma.product.update({ where: { id: i.productId }, data: { salesCount: { decrement: i.quantity } } })
          )
        : []),
      ...(shouldNotifyDelivery
        ? [
            prisma.notification.create({
              data: {
                userId: order.userId,
                type: "ORDER_DELIVERED",
                title: "Seu pedido foi entregue! 🌿",
                body: "Avalie sua experiência de compra.",
                link: "/perfil"
              }
            })
          ]
        : [])
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao atualizar pedido" }, { status: 500 });
  }
}
