import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";

export async function GET() {
  await requireAdmin();
  const materials = await prisma.materialCost.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(materials);
}

export async function POST(req: Request) {
  await requireAdmin();
  const { description, amount } = await req.json();
  if (!description || !(amount > 0)) {
    return NextResponse.json({ error: "Preencha descrição e valor corretamente" }, { status: 400 });
  }
  const material = await prisma.materialCost.create({ data: { description, amount } });
  return NextResponse.json(material, { status: 201 });
}
