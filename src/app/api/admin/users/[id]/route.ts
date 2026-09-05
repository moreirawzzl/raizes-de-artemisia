import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, getCurrentUser } from "@/lib/auth-helpers";
import { sendBanNoticeEmail } from "@/lib/mail";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await requireAdmin();
  const { id } = await params;
  const body = await req.json();
  const { role, banned, reason } = body;

  const updateData: any = {};

  if (role !== undefined) {
    if (!["USER", "ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Papel inválido" }, { status: 400 });
    }
    if ((me as any).id === id && role === "USER") {
      return NextResponse.json({ error: "Você não pode remover seu próprio acesso de admin" }, { status: 400 });
    }
    updateData.role = role;
  }

  if (banned !== undefined) {
    if ((me as any).id === id && banned === true) {
      return NextResponse.json({ error: "Você não pode banir a si mesmo" }, { status: 400 });
    }
    updateData.banned = banned;
    if (banned) {
      updateData.bannedAt = new Date();
      updateData.banReason = reason || null;
    } else {
      updateData.bannedAt = null;
      updateData.banReason = null;
    }
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      avatarUrl: true,
      provider: true,
      hasPassword: true,
      theme: true,
      fontSize: true,
      soundEnabled: true,
      animationsEnabled: true,
      allowGoogleLogin: true,
      banned: true,
      bannedAt: true,
      banReason: true,
      lastLoginAt: true,
      createdAt: true
    }
  });

  if (banned === true) {
    await sendBanNoticeEmail(user.email, reason);
  }

  return NextResponse.json(user);
}