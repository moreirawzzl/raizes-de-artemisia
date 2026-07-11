import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { formatMoney } from "@/lib/format";

export default async function PerfilPage() {
  const user = await requireUser();
  const dbUser = await prisma.user.findUnique({ where: { id: (user as any).id } });
  const orders = await prisma.order.findMany({ where: { userId: (user as any).id }, orderBy: { createdAt: "desc" } });
  const totalSpent = orders.reduce((a, o) => a + o.total, 0);

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-8 flex items-center gap-5">
        <img
          src={dbUser?.avatarUrl || "/images/monogram.jpg"}
          alt=""
          className="h-20 w-20 rounded-full border border-bege-claro object-cover"
        />
        <div>
          <h1 className="font-display text-3xl text-verde-principal">{dbUser?.username}</h1>
          <p className="text-sm text-verde-secundario">{dbUser?.email}</p>
          {dbUser?.role === "ADMIN" && (
            <span className="mt-1 inline-block rounded-full bg-verde-principal px-3 py-0.5 text-[10px] uppercase tracking-wide text-white">
              Administradora
            </span>
          )}
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4">
        <div className="rounded-xl2 border border-bege-claro bg-white p-5">
          <p className="text-[11px] uppercase tracking-wide text-verde-secundario">Pedidos feitos</p>
          <p className="mt-1 font-display text-3xl text-verde-principal">{orders.length}</p>
        </div>
        <div className="rounded-xl2 border border-bege-claro bg-white p-5">
          <p className="text-[11px] uppercase tracking-wide text-verde-secundario">Total gasto</p>
          <p className="mt-1 font-display text-3xl text-verde-principal">{formatMoney(totalSpent)}</p>
        </div>
      </div>

      <div className="mb-8 rounded-xl2 border border-bege-claro bg-white p-6">
        <h2 className="mb-4 font-display text-xl text-verde-principal">Últimos pedidos</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-verde-secundario">Você ainda não fez nenhum pedido.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {orders.slice(0, 8).map((o) => (
              <li key={o.id} className="flex justify-between border-b border-[#f0ece0] pb-1.5">
                <span>{new Date(o.createdAt).toLocaleDateString("pt-BR")}</span>
                <span className="text-verde-secundario">{formatMoney(o.total)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex gap-3">
        <Link href="/configuracoes" className="rounded-full border border-verde-principal px-5 py-2.5 text-xs text-verde-principal hover:bg-verde-principal hover:text-white">
          Configurações da conta
        </Link>
        {dbUser?.role === "ADMIN" && (
          <Link href="/admin" className="rounded-full bg-verde-principal px-5 py-2.5 text-xs text-white">
            Painel administrativo
          </Link>
        )}
      </div>
    </main>
  );
}
