import { prisma } from "@/lib/prisma";
import { MaterialCalculator } from "@/components/admin/MaterialCalculator";

export default async function CalculadoraPage() {
  const materials = await prisma.materialCost.findMany({ orderBy: { createdAt: "desc" } });
  const products = await prisma.product.findMany();
  const grossRevenue = products.reduce((a, p) => a + p.salesCount * p.price, 0);

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl text-verde-principal">Calculadora de custos</h1>
      <MaterialCalculator
        initialMaterials={materials.map(m => ({ ...m, createdAt: m.createdAt.toISOString() }))}
        grossRevenue={grossRevenue}
      />
    </div>
  );
}
