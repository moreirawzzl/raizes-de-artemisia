import { prisma } from "@/lib/prisma";
import { MaterialCalculator } from "@/components/admin/MaterialCalculator";

export default async function CalculadoraPage() {
  const shopSettings = await prisma.shopSettings.findUnique({ where: { id: "main" } });
  const materialCostResetAt = shopSettings?.materialCostResetAt ?? null;

  const materials = await prisma.materialCost.findMany({
    where: materialCostResetAt ? { createdAt: { gt: materialCostResetAt } } : {},
    orderBy: { createdAt: "desc" }
  });
  const products = await prisma.product.findMany();
  const grossRevenue = products.reduce((a, p) => a + p.salesCount * p.price, 0);

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl text-verde-principal">Calculadora de custos</h1>
      {materialCostResetAt && (
        <p className="mb-4 text-xs text-bege-escuro">
          Exibindo custos lançados após {new Date(materialCostResetAt).toLocaleString("pt-BR")}
        </p>
      )}
      <MaterialCalculator
        initialMaterials={materials.map(m => ({ ...m, createdAt: m.createdAt.toISOString() }))}
        grossRevenue={grossRevenue}
      />
    </div>
  );
}
