import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { z } from "zod";

const couponSchema = z.object({
  code: z.string().min(3).max(20),
  percentage: z.number().int().min(1).max(100),
  validUntil: z.string() // ISO date
});

export async function GET() {
  await requireAdmin();
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(coupons);
}

export async function POST(req: Request) {
  await requireAdmin();
  const body = await req.json();
  const parsed = couponSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const code = parsed.data.code.trim().toUpperCase();
  const existing = await prisma.coupon.findUnique({ where: { code } });
  if (existing) return NextResponse.json({ error: "Já existe um cupom com esse código" }, { status: 409 });

  const coupon = await prisma.coupon.create({
    data: { code, percentage: parsed.data.percentage, validUntil: new Date(parsed.data.validUntil) }
  });
  return NextResponse.json(coupon, { status: 201 });
}
