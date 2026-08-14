import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { formatMoney } from "@/lib/format";
import { buildWhatsappCheckoutUrl } from "@/lib/whatsapp";

/**
 * Recebe os itens exatamente como estão na tela do cliente (fonte da
 * verdade), cria o pedido como AWAITING_PAYMENT.
 *
 * IMPORTANTE: o carrinho NÃO é limpo aqui. Ele só é limpo quando a
 * administradora confirmar o pagamento (em /admin/pedidos) — assim o
 * produto continua "no carrinho" até o pagamento ser finalizado de
 * verdade, exatamente como pedido.
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

  const order = await prisma.order.create({
    data: {
      userId: (user as any).id,
      subtotal,
      discount,
      couponCode: appliedCouponCode,
      total,
      status: "AWAITING_PAYMENT",
      whatsappText: whatsappUrl,
      items: {
        create: validItems.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.product!.price
        }))
      }
    }
  });

  return NextResponse.json({ whatsappUrl, total, discount, orderId: order.id });
}