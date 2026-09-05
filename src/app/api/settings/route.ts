import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { z } from "zod";

const patchSchema = z.object({
  theme: z.enum(["light", "dark"]).optional(),
  fontSize: z.enum(["small", "medium", "large"]).optional(),
  soundEnabled: z.boolean().optional(),
  animationsEnabled: z.boolean().optional(),
  allowGoogleLogin: z.boolean().optional(),
  username: z.string().min(3).max(24).optional(),
  avatarUrl: z.string().optional()
});

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });

  const userId = (user as any).id;

  if (parsed.data.username) {
    const existing = await prisma.user.findFirst({
      where: {
        username: parsed.data.username,
        id: { not: userId }
      }
    });
    if (existing) {
      return NextResponse.json({ error: "Este nome de usuário já está em uso" }, { status: 409 });
    }
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: parsed.data
  });

  return NextResponse.json({
    theme: updated.theme,
    fontSize: updated.fontSize,
    soundEnabled: updated.soundEnabled,
    animationsEnabled: updated.animationsEnabled,
    allowGoogleLogin: updated.allowGoogleLogin,
    username: updated.username,
    avatarUrl: updated.avatarUrl
  });
}
