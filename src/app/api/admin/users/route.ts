import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";

export async function GET() {
  await requireAdmin();
  const users = await prisma.user.findMany({
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
    },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(users);
}