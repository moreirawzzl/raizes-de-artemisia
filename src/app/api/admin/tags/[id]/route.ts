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

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await requireAdmin();
  const { id } = await params;
  const body = await req.json();
  const parsed = tagSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const existing = await prisma.tag.findFirst({ where: { name: parsed.data.name, id: { not: id } } });
  if (existing) return NextResponse.json({ error: "Já existe uma etiqueta com esse nome" }, { status: 409 });

  // Atualiza a mesma linha (não cria cópia) — reflete automaticamente em
  // todo produto que já usa essa etiqueta, já que a relação aponta pro
  // mesmo Tag.id.
  const tag = await prisma.tag.update({ where: { id }, data: parsed.data });

  await logAdminAction({
    adminId: (me as any).id,
    action: "UPDATE_TAG",
    details: tag.name
  });

  return NextResponse.json(tag);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await requireAdmin();
  const { id } = await params;

  const tag = await prisma.tag.findUnique({ where: { id } });
  if (!tag) return NextResponse.json({ error: "Etiqueta não encontrada" }, { status: 404 });

  // Exclui só a etiqueta e as linhas de junção (Prisma cuida disso pela
  // relação implícita) — os produtos que usavam ela continuam existindo
  // normalmente, só perdem essa etiqueta específica.
  await prisma.tag.delete({ where: { id } });

  await logAdminAction({
    adminId: (me as any).id,
    action: "DELETE_TAG",
    details: tag.name
  });

  return NextResponse.json({ ok: true });
}
