export type SortOption =
  | "relevancia"
  | "preco-asc"
  | "preco-desc"
  | "mais-vendidos"
  | "menos-vendidos"
  | "mais-vistos"
  | "menos-vistos"
  | "mais-recentes"
  | "mais-antigos"
  | "a-z"
  | "z-a";

export interface ProductWithImages {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  stock: number;
  viewCount: number;
  salesCount: number;
  images: { id: string; url: string }[];
  category?: { name: string } | null;
}
