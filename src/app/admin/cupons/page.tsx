import { prisma } from "@/lib/prisma";
import { CouponManager } from "@/components/admin/CouponManager";

export default async function AdminCuponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <h1 className="mb-6 font-display text-3xl text-verde-principal">Cupons de desconto</h1>
      <CouponManager initialCoupons={coupons.map(c => ({ ...c, validUntil: c.validUntil.toISOString(), createdAt: c.createdAt.toISOString() }))} />
    </div>
  );
}
