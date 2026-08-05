import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";

export async function GET() {
  await requireAdmin();
  const settings = await prisma.shopSettings.findUnique({ where: { id: "main" } });
  return NextResponse.json({ revenueResetAt: settings?.revenueResetAt ?? null });
}

export async function POST() {
  await requireAdmin();
  const settings = await prisma.shopSettings.upsert({
    where: { id: "main" },
    update: { revenueResetAt: new Date() },
    create: { id: "main", revenueResetAt: new Date() }
  });
  return NextResponse.json(settings);
}
