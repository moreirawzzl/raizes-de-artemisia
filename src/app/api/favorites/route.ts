import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ productIds: [] });

  const favorites = await prisma.favorite.findMany({
    where: { userId: (user as any).id },
    select: { productId: true }
  });

  return NextResponse.json({ productIds: favorites.map((f) => f.productId) });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { productId } = await request.json();
  if (!productId || typeof productId !== "string") {
    return NextResponse.json({ error: "Produto inválido" }, { status: 400 });
  }

  const existing = await prisma.favorite.findUnique({
    where: { userId_productId: { userId: (user as any).id, productId } }
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ favorited: false });
  } else {
    await prisma.favorite.create({ data: { userId: (user as any).id, productId } });
    return NextResponse.json({ favorited: true });
  }
}