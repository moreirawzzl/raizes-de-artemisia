import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { logAdminAction } from "@/lib/admin-log";

export async function GET() {
  await requireAdmin();
  const settings = await prisma.shopSettings.findUnique({ where: { id: "main" } });
  return NextResponse.json({ revenueResetAt: settings?.revenueResetAt ?? null });
}

export async function POST() {
  const me = await requireAdmin();
  const settings = await prisma.shopSettings.upsert({
    where: { id: "main" },
    update: { revenueResetAt: new Date() },
    create: { id: "main", revenueResetAt: new Date() }
  });

  await logAdminAction({
    adminId: (me as any).id,
    action: "RESET_REVENUE",
    details: "Zerou a data de corte do faturamento (reset seguro, sem apagar pedidos)"
  });

  return NextResponse.json(settings);
}
