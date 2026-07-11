import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { formatMoney } from "@/lib/format";
import { DeleteProductButton } from "@/components/admin/DeleteProductButton";
import { RestoreProductButton } from "@/components/admin/RestoreProductButton";

export default async function AdminProdutosPage() {
  const products = await prisma.product.findMany({ include: { images: true }, orderBy: { createdAt: "desc" } });
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl text-verde-principal">Produtos cadastrados</h1>
        <Link href="/admin/produtos/novo" className="rounded-full bg-verde-principal px-5 py-2.5 text-xs text-white">+ Adicionar produto</Link>
      </div>
      <div className="overflow-x-auto rounded-xl2 border border-bege-claro bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-bege-claro text-left text-[10.5px] uppercase tracking-wide text-verde-secundario">
              <th className="p-3">Foto</th>
              <th className="p-3">Nome</th>
              <th className="p-3">Preço</th>
              <th className="p-3">Estoque</th>
              <th className="p-3">Views</th>
              <th className="p-3">Vendas</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className={`border-b border-[#f0ece0] ${p.hidden ? "opacity-50" : ""}`}>
                <td className="p-3">
                  <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-bege-claro">
                    <Image src={p.images[0]?.url || "/images/monogram.jpg"} alt="" fill className="object-cover" />
                  </div>
                </td>
                <td className="p-3">{p.name}</td>
                <td className="p-3">{formatMoney(p.price.toString())}</td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3">{p.viewCount}</td>
                <td className="p-3">{p.salesCount}</td>
                <td className="p-3">
                  {p.hidden ? (
                    <span className="rounded-full bg-[#F3E6C8] px-2.5 py-1 text-[10px] text-[#8A6D1F]">Oculto</span>
                  ) : (
                    <span className="rounded-full bg-[#DCEBD6] px-2.5 py-1 text-[10px] text-verde-principal">Ativo</span>
                  )}
                </td>
                <td className="p-3 text-right whitespace-nowrap">
                  <Link href={`/admin/produtos/${p.id}/editar`} className="mr-3 text-xs text-verde-secundario underline">editar</Link>
                  {p.hidden ? <RestoreProductButton id={p.id} /> : <DeleteProductButton id={p.id} />}
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={8} className="p-8 text-center text-verde-secundario">Nenhum produto ainda.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
