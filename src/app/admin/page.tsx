import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/admin/StatCard";
import { formatMoney } from "@/lib/format";

export default async function AdminDashboard() {
  const [totalUsers, totalProducts, orders, products, materials] = await Promise.all([
    prisma.user.count({ where: { role: "USER" } }),
    prisma.product.count(),
    prisma.order.findMany({ include: { user: true }, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.product.findMany(),
    prisma.materialCost.findMany()
  ]);

  const totalViews = products.reduce((a, p) => a + p.viewCount, 0);
  const totalSales = products.reduce((a, p) => a + p.salesCount, 0);
  const revenue = products.reduce((a, p) => a + p.salesCount * Number(p.price), 0);
  const materialCosts = materials.reduce((a, m) => a + m.amount, 0);
  const netRevenue = revenue - materialCosts;

  const maisVendidos = [...products].sort((a, b) => b.salesCount - a.salesCount).slice(0, 5);
  const maisVistos = [...products].sort((a, b) => b.viewCount - a.viewCount).slice(0, 5);
  const novosUsuarios = await prisma.user.findMany({ where: { role: "USER" }, orderBy: { createdAt: "desc" }, take: 5 });

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl text-verde-principal">Painel geral</h1>

      <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Membros" value={totalUsers} />
        <StatCard label="Produtos" value={totalProducts} />
        <StatCard label="Visualizações" value={totalViews} />
        <StatCard label="Vendas" value={totalSales} />
        <StatCard label="Receita bruta" value={formatMoney(revenue)} />
      </div>
      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Custo de materiais" value={formatMoney(materialCosts)} />
        <StatCard label="Receita líquida" value={formatMoney(netRevenue)} />
        <Link href="/admin/calculadora" className="flex items-center justify-center rounded-xl2 border border-dashed border-bege-escuro bg-white p-5 text-xs text-verde-secundario hover:bg-fundo">
          + Lançar custo de material
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl2 border border-bege-claro bg-white p-6">
          <h2 className="mb-3 font-display text-xl text-verde-principal">Mais vendidos</h2>
          <ul className="space-y-2 text-sm">
            {maisVendidos.map((p) => (
              <li key={p.id} className="flex justify-between border-b border-[#f0ece0] pb-1.5">
                <span>{p.name}</span><span className="text-verde-secundario">{p.salesCount} vendas</span>
              </li>
            ))}
            {maisVendidos.length === 0 && <li className="text-verde-secundario">Nenhuma venda ainda.</li>}
          </ul>
        </div>

        <div className="rounded-xl2 border border-bege-claro bg-white p-6">
          <h2 className="mb-3 font-display text-xl text-verde-principal">Mais vistos</h2>
          <ul className="space-y-2 text-sm">
            {maisVistos.map((p) => (
              <li key={p.id} className="flex justify-between border-b border-[#f0ece0] pb-1.5">
                <span>{p.name}</span><span className="text-verde-secundario">{p.viewCount} views</span>
              </li>
            ))}
            {maisVistos.length === 0 && <li className="text-verde-secundario">Nenhuma visualização ainda.</li>}
          </ul>
        </div>

        <div className="rounded-xl2 border border-bege-claro bg-white p-6">
          <h2 className="mb-3 font-display text-xl text-verde-principal">Novos usuários</h2>
          <ul className="space-y-2 text-sm">
            {novosUsuarios.map((u) => (
              <li key={u.id} className="flex justify-between border-b border-[#f0ece0] pb-1.5">
                <span>{u.username}</span><span className="text-verde-secundario">{u.email}</span>
              </li>
            ))}
            {novosUsuarios.length === 0 && <li className="text-verde-secundario">Nenhum cadastro ainda.</li>}
          </ul>
        </div>

        <div className="rounded-xl2 border border-bege-claro bg-white p-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-xl text-verde-principal">Últimos pedidos</h2>
            <Link href="/admin/pedidos" className="text-xs text-verde-secundario underline">Ver todos</Link>
          </div>
          <ul className="space-y-2 text-sm">
            {orders.map((o) => (
              <li key={o.id} className="flex justify-between border-b border-[#f0ece0] pb-1.5">
                <span>{o.user.username} <span className="text-[10px] text-bege-escuro">({o.status === "PAID" ? "pago" : o.status === "CANCELED" ? "cancelado" : "aguardando"})</span></span>
                <span className="text-verde-secundario">{formatMoney(o.total.toString())}</span>
              </li>
            ))}
            {orders.length === 0 && <li className="text-verde-secundario">Nenhum pedido ainda.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
