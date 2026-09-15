import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NovoProdutoPage() {
  const tags = await prisma.tag.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl text-verde-principal">Adicionar produto</h1>
      <ProductForm availableTags={tags} />
    </div>
  );
}
