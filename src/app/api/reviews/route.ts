import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";

// POST — client submits a review
export async function POST(req: Request) {
  const user = await requireUser();
  const userId = (user as any).id as string;
  const { orderId, productId, rating, comment } = await req.json();

  if (!orderId || !productId || !rating) {
    return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 });
  }
  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Avaliação deve ser entre 1 e 5" }, { status: 400 });
  }

  // Validate order belongs to user and is DELIVERED
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId, status: "DELIVERED" },
    include: { items: true }
  });

  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado ou ainda não entregue" }, { status: 404 });
  }

  // Validate product is in the order
  const itemInOrder = order.items.some((i) => i.productId === productId);
  if (!itemInOrder) {
    return NextResponse.json({ error: "Produto não pertence a este pedido" }, { status: 400 });
  }

  // Check if already reviewed
  const existing = await prisma.review.findUnique({
    where: { orderId_productId: { orderId, productId } }
  });
  if (existing) {
    return NextResponse.json({ error: "Produto já avaliado neste pedido" }, { status: 409 });
  }

  const review = await prisma.review.create({
    data: { orderId, productId, userId, rating, comment: comment?.trim() || null }
  });

  return NextResponse.json(review, { status: 201 });
}

// GET — public: get reviews for a product
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");

  if (!productId) {
    return NextResponse.json({ error: "productId obrigatório" }, { status: 400 });
  }

  const reviews = await prisma.review.findMany({
    where: { productId },
    include: { user: { select: { username: true, avatarUrl: true } } },
    orderBy: { createdAt: "desc" }
  });

  const avg =
    reviews.length > 0
      ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length
      : null;

  return NextResponse.json({ reviews, avg, count: reviews.length });
}
