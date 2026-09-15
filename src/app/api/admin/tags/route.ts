import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { logAdminAction } from "@/lib/admin-log";
import { z } from "zod";

const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor inválida (use formato #RRGGBB)");

const tagSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(30),
  bgColor: hexColor,
  borderColor: hexColor,
  textColor: hexColor
});

export async function GET() {
  await requireAdmin();
  const tags = await prisma.tag.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(tags);
}

export async function POST(req: Request) {
  const me = await requireAdmin();
  const body = await req.json();
  const parsed = tagSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const existing = await prisma.tag.findUnique({ where: { name: parsed.data.name } });
  if (existing) return NextResponse.json({ error: "Já existe uma etiqueta com esse nome" }, { status: 409 });

  const tag = await prisma.tag.create({ data: parsed.data });

  await logAdminAction({
    adminId: (me as any).id,
    action: "CREATE_TAG",
    details: tag.name
  });

  return NextResponse.json(tag, { status: 201 });
}
