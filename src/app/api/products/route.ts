import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(1),
  benefits: z.string().optional(),
  usage: z.string().optional(),
  care: z.string().optional(),
  weight: z.string().optional(),
  price: z.number().positive(),
  stock: z.number().int().min(0).default(0),
  featured: z.boolean().default(false),
  images: z.array(z.string()).default([]),
  categoryId: z.string().optional().nullable()
});

function slugify(name: string) {
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now().toString(36).slice(-4);
}

export async function GET() {
  const products = await prisma.product.findMany({
    include: { images: true, category: true },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  await requireAdmin();
  const body = await req.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const { images, ...data } = parsed.data;
  const product = await prisma.product.create({
    data: {
      ...data,
      slug: slugify(data.name),
      images: { create: images.map((url, i) => ({ url, position: i })) }
    },
    include: { images: true }
  });

  return NextResponse.json(product, { status: 201 });
}
