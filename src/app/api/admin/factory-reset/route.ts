import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { logAdminAction } from "@/lib/admin-log";

export async function POST() {
  try {
    const me = await requireAdmin();

    // 1. Apaga todos os pedidos (isso apaga os OrderItems e Reviews relacionados por causa do Cascade)
    await prisma.order.deleteMany();

    // 2. Apaga todos os MaterialCost
    await prisma.materialCost.deleteMany();

    // 3. Zera salesCount e viewCount de todos os produtos
    await prisma.product.updateMany({
      data: {
        salesCount: 0,
        viewCount: 0
      }
    });

    // 4. Limpa revenueResetAt e materialCostResetAt
    await prisma.shopSettings.upsert({
      where: { id: "main" },
      create: { id: "main", revenueResetAt: null, materialCostResetAt: null },
      update: { revenueResetAt: null, materialCostResetAt: null }
    });

    await logAdminAction({
      adminId: (me as any).id,
      action: "FACTORY_RESET",
      details: "Apagou todos os pedidos, custos de material e zerou estatísticas de venda/visualização"
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro no factory reset:", error);
    return NextResponse.json({ error: "Erro ao realizar o factory reset" }, { status: 500 });
  }
}
