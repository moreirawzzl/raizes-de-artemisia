import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductGrid } from "@/components/store/ProductGrid";

export default async function HomePage() {
  const destaques = await prisma.product.findMany({
    where: { hidden: false, featured: true },
    include: { images: true },
    take: 8
  });

  const maisVendidos = await prisma.product.findMany({
    where: { hidden: false },
    include: { images: true },
    orderBy: { salesCount: "desc" },
    take: 8
  });

  return (
    <main>
      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pt-16 pb-8 text-center">
        <Image src="/images/sprig.jpg" alt="" width={140} height={140} className="mx-auto mb-3 opacity-90" />
        <h1 className="font-display text-5xl text-verde-principal">Raízes de Artemísia</h1>
        <p className="mt-3 text-[13px] tracking-[2px] uppercase text-verde-secundario">Produção Artesanal</p>
        <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-[#5c5c50]">
          Ervas, ritual e conexão — produtos artesanais feitos com respeito à natureza,
          para transformar o cotidiano em momentos de autocuidado.
        </p>
        <Link href="/loja">
          <button className="mt-7 rounded-xl2 bg-verde-principal px-8 py-3 text-sm tracking-wide text-white hover:bg-[#455a40]">
            Ver todos os produtos
          </button>
        </Link>
      </section>

      {/* Destaques */}
      {destaques.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-10">
          <h2 className="font-display text-3xl text-verde-principal mb-6">Produtos em destaque</h2>
          <ProductGrid products={destaques as any} />
        </section>
      )}

      {/* Mais vendidos */}
      {maisVendidos.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-10">
          <h2 className="font-display text-3xl text-verde-principal mb-6">Mais vendidos</h2>
          <ProductGrid products={maisVendidos as any} />
        </section>
      )}

      {/* Sobre a marca */}
      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h2 className="font-display text-3xl text-verde-principal mb-4">Sobre a marca</h2>
        <p className="text-sm leading-relaxed text-[#5c5c50]">
          A Raízes de Artemísia busca transmitir simplicidade, respeito pela natureza e cuidado artesanal.
          Cada produto nasce de um processo lento e intencional, valorizando a beleza das ervas e dos
          rituais cotidianos — sem exageros visuais ou promessas de resultado.
        </p>
      </section>

      <footer className="border-t border-bege-claro py-10 text-center text-[11px] text-bege-escuro font-body">
        <Image src="/images/sprig.jpg" alt="" width={100} height={100} className="mx-auto mb-3 opacity-80" />
        Raízes de Artemísia — Produção Artesanal
      </footer>
    </main>
  );
}
