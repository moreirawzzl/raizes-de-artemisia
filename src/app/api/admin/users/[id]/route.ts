import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, getCurrentUser } from "@/lib/auth-helpers";
import { sendBanNoticeEmail } from "@/lib/mail";
import { logAdminAction } from "@/lib/admin-log";

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
    if (banned === true && !reason?.trim()) {
      return NextResponse.json({ error: "Informe o motivo do banimento" }, { status: 400 });
    }
    updateData.banned = banned;
    if (banned) {
      updateData.bannedAt = new Date();
      updateData.banReason = reason.trim();
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

  if (role !== undefined) {
    await logAdminAction({
      adminId: (me as any).id,
      action: role === "ADMIN" ? "PROMOTE_ADMIN" : "DEMOTE_ADMIN",
      targetUserId: id,
      details: `${user.username} (${user.email})`
    });
  }

  if (banned !== undefined) {
    await logAdminAction({
      adminId: (me as any).id,
      action: banned ? "BAN_USER" : "UNBAN_USER",
      targetUserId: id,
      details: banned ? `${user.username} (${user.email})${reason ? ` — motivo: ${reason}` : ""}` : `${user.username} (${user.email})`
    });
  }

  return NextResponse.json(user);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await requireAdmin();
  const { id } = await params;

  if ((me as any).id === id) {
    return NextResponse.json({ error: "Você não pode excluir a si mesmo" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

  // Order não tem onDelete: Cascade pro User de propósito (é histórico
  // financeiro) — não dá pra apagar quem já fez pedido. Sugere banir.
  const orderCount = await prisma.order.count({ where: { userId: id } });
  if (orderCount > 0) {
    return NextResponse.json(
      { error: `Esse usuário tem ${orderCount} pedido(s) no histórico e não pode ser excluído — use banir em vez de excluir.` },
      { status: 409 }
    );
  }

  // onDelete: Cascade no schema cuida do resto (carrinho, favoritos,
  // mensagens, avaliações etc.) associados a esse usuário.
  await prisma.user.delete({ where: { id } });

  await logAdminAction({
    adminId: (me as any).id,
    action: "DELETE_USER",
    details: `${user.username} (${user.email})`
  });

  return NextResponse.json({ ok: true });
}