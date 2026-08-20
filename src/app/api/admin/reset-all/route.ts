import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";

export async function POST() {
  try {
    await requireAdmin();
    const now = new Date();

    await prisma.shopSettings.upsert({
      where: { id: "main" },
      update: { revenueResetAt: now, materialCostResetAt: now },
      create: { id: "main", revenueResetAt: now, materialCostResetAt: now }
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao zerar" }, { status: 500 });
  }
}
