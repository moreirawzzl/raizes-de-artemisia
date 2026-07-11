import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function EditarProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id }, include: { images: true } });
  if (!product) notFound();

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl text-verde-principal">Editar produto</h1>
      <ProductForm
        initial={{
          id: product.id,
          name: product.name,
          description: product.description,
          benefits: product.benefits ?? "",
          usage: product.usage ?? "",
          care: product.care ?? "",
          weight: product.weight ?? "",
          price: product.price.toString(),
          stock: product.stock,
          featured: product.featured,
          images: product.images.map((i) => i.url)
        }}
      />
    </div>
  );
}
