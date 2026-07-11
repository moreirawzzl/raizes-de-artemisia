import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const { status } = await req.json();

    if (!["PAID", "AWAITING_PAYMENT", "CANCELED"].includes(status)) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });

    // Só incrementa salesCount na transição PARA "PAID" vindo de outro
    // status — evita contar duas vezes se clicar confirmar de novo.
    const shouldIncrement = status === "PAID" && order.status !== "PAID";
    // Se estava PAID e for movido pra outro status (ex: cancelado por engano
    // depois de confirmado), desconta de volta.
    const shouldDecrement = order.status === "PAID" && status !== "PAID";

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
        : [])
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao atualizar pedido" }, { status: 500 });
  }
}
