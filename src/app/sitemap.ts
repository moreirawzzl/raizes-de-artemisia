import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const products = await prisma.product.findMany({
    where: { hidden: false },
    select: { id: true, slug: true, updatedAt: true }
  });

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/loja`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/login`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/register`, changeFrequency: "monthly", priority: 0.3 }
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${baseUrl}/produto/${p.slug || p.id}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7
  }));

  return [...staticRoutes, ...productRoutes];
}
