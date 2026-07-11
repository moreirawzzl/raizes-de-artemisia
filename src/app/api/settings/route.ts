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

  const updated = await prisma.user.update({
    where: { id: (user as any).id },
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
