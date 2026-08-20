import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ notifications: [], unread: 0 });

  const notifications = await prisma.notification.findMany({
    where: { userId: (user as any).id },
    orderBy: { createdAt: "desc" },
    take: 30
  });
  const unread = notifications.filter((n) => !n.read).length;

  return NextResponse.json({ notifications, unread });
}

export async function PATCH() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  await prisma.notification.updateMany({
    where: { userId: (user as any).id, read: false },
    data: { read: true }
  });

  return NextResponse.json({ ok: true });
}