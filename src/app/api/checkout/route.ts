import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { formatMoney } from "@/lib/format";
import { buildWhatsappCheckoutUrl } from "@/lib/whatsapp";

/**
 * Recebe os itens exatamente como estão na tela do cliente (fonte da
 * verdade) em vez de re-ler o carrinho do banco — isso evita o bug em que
 * uma alteração de quantidade feita bem antes de finalizar não refletia
 * a tempo no total/mensagem final por causa de uma corrida entre o
 * PATCH de quantidade e o checkout.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const clientItems: { productId: string; quantity: number }[] = body.items || [];
  const couponCode: string | undefined = body.couponCode;

  if (!clientItems.length) return NextResponse.json({ error: "Carrinho vazio" }, { status: 400 });

  const productIds = clientItems.map((i) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
  const productMap = new Map(products.map((p) => [p.id, p]));

  const validItems = clientItems
    .map((i) => ({ ...i, product: productMap.get(i.productId) }))
    .filter((i) => i.product && i.quantity > 0);

  if (!validItems.length) return NextResponse.json({ error: "Carrinho vazio" }, { status: 400 });

  const subtotal = validItems.reduce((s, i) => s + i.product!.price * i.quantity, 0);

  let discount = 0;
  let appliedCouponCode: string | null = null;
  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.trim().toUpperCase() } });
    if (coupon && coupon.active && coupon.validUntil >= new Date()) {
      discount = subtotal * (coupon.percentage / 100);
      appliedCouponCode = coupon.code;
    }
  }
  const total = Math.max(0, subtotal - discount);

  const whatsappUrl = buildWhatsappCheckoutUrl(
    validItems.map((i) => ({ name: i.product!.name, quantity: i.quantity })),
    formatMoney(total)
  );

  const cart = await prisma.cart.upsert({
    where: { userId: (user as any).id },
    update: {},
    create: { userId: (user as any).id }
  });

  await prisma.$transaction([
    prisma.order.create({
      data: {
        userId: (user as any).id,
        subtotal,
        discount,
        couponCode: appliedCouponCode,
        total,
        whatsappText: whatsappUrl,
        items: {
          create: validItems.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            unitPrice: i.product!.price
          }))
        }
      }
    }),
    ...validItems.map((i) =>
      prisma.product.update({ where: { id: i.productId }, data: { salesCount: { increment: i.quantity } } })
    ),
    prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
  ]);

  return NextResponse.json({ whatsappUrl, total, discount });
}
