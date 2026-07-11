import { ProductCard } from "./ProductCard";

interface Props {
  products: {
    id: string;
    slug: string;
    name: string;
    description: string;
    price: string;
    images: { url: string }[];
  }[];
}

export function ProductGrid({ products }: Props) {
  if (products.length === 0) {
    return (
      <div className="rounded-xl2 border border-dashed border-bege-claro py-16 text-center text-sm text-verde-secundario">
        Nenhum produto encontrado ainda. 🌿
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
