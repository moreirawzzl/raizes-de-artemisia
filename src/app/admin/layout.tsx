import Link from "next/link";
import { requireAdmin } from "@/lib/auth-helpers";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-8 flex flex-wrap gap-2">
        <Link href="/admin" className="rounded-full border border-bege-claro bg-white px-5 py-2 text-xs text-verde-principal hover:bg-verde-principal hover:text-white">Painel geral</Link>
        <Link href="/admin/produtos" className="rounded-full border border-bege-claro bg-white px-5 py-2 text-xs text-verde-principal hover:bg-verde-principal hover:text-white">Produtos</Link>
        <Link href="/admin/produtos/novo" className="rounded-full border border-bege-claro bg-white px-5 py-2 text-xs text-verde-principal hover:bg-verde-principal hover:text-white">Adicionar produto</Link>
        <Link href="/admin/cupons" className="rounded-full border border-bege-claro bg-white px-5 py-2 text-xs text-verde-principal hover:bg-verde-principal hover:text-white">Cupons</Link>
        <Link href="/admin/pedidos" className="rounded-full border border-bege-claro bg-white px-5 py-2 text-xs text-verde-principal hover:bg-verde-principal hover:text-white">Pedidos</Link>
        <Link href="/admin/calculadora" className="rounded-full border border-bege-claro bg-white px-5 py-2 text-xs text-verde-principal hover:bg-verde-principal hover:text-white">Calculadora</Link>
        <Link href="/admin/usuarios" className="rounded-full border border-bege-claro bg-white px-5 py-2 text-xs text-verde-principal hover:bg-verde-principal hover:text-white">Usuários</Link>
        <Link href="/admin/conversas" className="rounded-full border border-bege-claro bg-white px-5 py-2 text-xs text-verde-principal hover:bg-verde-principal hover:text-white">Conversas</Link>
        <Link href="/admin/avisos" className="rounded-full border border-bege-claro bg-white px-5 py-2 text-xs text-verde-principal hover:bg-verde-principal hover:text-white">Avisos</Link>
      </div>
      {children}
    </div>
  );
}