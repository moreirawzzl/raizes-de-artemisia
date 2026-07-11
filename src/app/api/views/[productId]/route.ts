import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function POST(_req: Request, { params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  const user = await getCurrentUser();

  await prisma.$transaction([
    prisma.product.update({ where: { id: productId }, data: { viewCount: { increment: 1 } } }),
    prisma.productView.create({ data: { productId, userId: (user as any)?.id } })
  ]);

  return NextResponse.json({ ok: true });
}
