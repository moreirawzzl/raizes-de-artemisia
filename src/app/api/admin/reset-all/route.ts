import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { logAdminAction } from "@/lib/admin-log";

export async function POST() {
  try {
    const me = await requireAdmin();
    const now = new Date();

    await prisma.shopSettings.upsert({
      where: { id: "main" },
      update: { revenueResetAt: now, materialCostResetAt: now },
      create: { id: "main", revenueResetAt: now, materialCostResetAt: now }
    });

    await logAdminAction({
      adminId: (me as any).id,
      action: "RESET_ALL",
      details: "Zerou faturamento e custo de material (reset seguro, sem apagar pedidos)"
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao zerar" }, { status: 500 });
  }
}
