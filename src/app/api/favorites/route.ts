import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Não autenticado" },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  });

  if (!user) {
    return NextResponse.json(
      { error: "Usuário não encontrado" },
      { status: 404 }
    );
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    select: { productId: true }
  });

  return NextResponse.json({
    productIds: favorites.map((favorite) => favorite.productId)
  });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Não autenticado" },
      { status: 401 }
    );
  }

  const body = await request.json();
  const productId = body.productId;

  if (!productId || typeof productId !== "string") {
    return NextResponse.json(
      { error: "Produto inválido" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  });

  if (!user) {
    return NextResponse.json(
      { error: "Usuário não encontrado" },
      { status: 404 }
    );
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true }
  });

  if (!product) {
    return NextResponse.json(
      { error: "Produto não encontrado" },
      { status: 404 }
    );
  }

  const existing = await prisma.favorite.findUnique({
    where: {
      userId_productId: {
        userId: user.id,
        productId
      }
    }
  });

  if (existing) {
    await prisma.favorite.delete({
      where: { id: existing.id }
    });

    return NextResponse.json({
      favorited: false
    });
  }

  await prisma.favorite.create({
    data: {
      userId: user.id,
      productId
    }
  });

  return NextResponse.json({
    favorited: true
  });
}