import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/format";
import { OrderActions } from "@/components/admin/OrderActions";

const statusLabel: Record<string, string> = {
  AWAITING_PAYMENT: "Aguardando pagamento",
  PAID: "Pago",
  CANCELED: "Cancelado"
};

const statusColor: Record<string, string> = {
  AWAITING_PAYMENT: "bg-[#F3E6C8] text-[#8A6D1F]",
  PAID: "bg-[#DCEBD6] text-verde-principal",
  CANCELED: "bg-red-50 text-red-500"
};

export default async function PedidosPage() {
  const orders = await prisma.order.findMany({
    include: { user: true, items: { include: { product: true } } },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl text-verde-principal">Pedidos</h1>
      <div className="space-y-4">
        {orders.map((o) => (
          <div key={o.id} className="rounded-xl2 border border-bege-claro bg-white p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-verde-principal">{o.user.username}</p>
                <p className="text-xs text-bege-escuro">{o.user.email} · {new Date(o.createdAt).toLocaleString("pt-BR")}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-[11px] font-medium ${statusColor[o.status] || ""}`}>
                {statusLabel[o.status] || o.status}
              </span>
            </div>

            <ul className="mb-3 space-y-1 text-sm text-[#5c5c50]">
              {o.items.map((it) => (
                <li key={it.id} className="flex justify-between">
                  <span>{it.product.name} × {it.quantity}</span>
                  <span>{formatMoney((it.unitPrice * it.quantity).toString())}</span>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between border-t border-[#f0ece0] pt-3">
              <p className="font-display text-lg text-verde-principal">
                Total: {formatMoney(o.total.toString())}
                {o.discount > 0 && (
                  <span className="ml-2 text-xs text-verde-secundario">(desconto de {formatMoney(o.discount.toString())})</span>
                )}
              </p>
              <OrderActions orderId={o.id} status={o.status} />
            </div>
          </div>
        ))}
        {orders.length === 0 && <p className="text-verde-secundario">Nenhum pedido ainda.</p>}
      </div>
    </div>
  );
}
