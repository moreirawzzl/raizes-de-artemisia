import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";

export async function GET(req: Request) {
  await requireAdmin();
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!from || !to) return NextResponse.json({ error: "Informe as duas datas" }, { status: 400 });

  const toDate = new Date(to);
  toDate.setHours(23, 59, 59, 999);

  const orders = await prisma.order.findMany({
    where: {
      status: { in: ["CONFIRMED", "DELIVERED"] },
      createdAt: { gte: new Date(from), lte: toDate }
    },
    include: { items: true }
  });

  const revenue = orders.reduce((a, o) => a + o.total, 0);
  const salesCount = orders.reduce((a, o) => a + o.items.reduce((s, i) => s + i.quantity, 0), 0);

  return NextResponse.json({ revenue, salesCount, ordersCount: orders.length });
}