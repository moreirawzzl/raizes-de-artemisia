import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { code } = await req.json();
  if (!code) return NextResponse.json({ valid: false, error: "Informe um código" }, { status: 400 });

  const coupon = await prisma.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });

  if (!coupon || !coupon.active) {
    return NextResponse.json({ valid: false, error: "Cupom inválido" }, { status: 404 });
  }
  if (coupon.validUntil < new Date()) {
    return NextResponse.json({ valid: false, error: "Este cupom expirou" }, { status: 400 });
  }

  return NextResponse.json({ valid: true, code: coupon.code, percentage: coupon.percentage });
}
