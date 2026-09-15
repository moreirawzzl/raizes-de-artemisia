import { prisma } from "@/lib/prisma";
import { TagsManager } from "@/components/admin/TagsManager";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Etiquetas",
  robots: { index: false, follow: false }
};

export default async function AdminEtiquetasPage() {
  const tags = await prisma.tag.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl text-verde-principal">Etiquetas</h1>
      <TagsManager initialTags={tags} />
    </div>
  );
}
