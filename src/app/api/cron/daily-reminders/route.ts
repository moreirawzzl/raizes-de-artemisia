import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendAbandonedCartEmail, sendReengagementEmail } from "@/lib/mail";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Carrinhos abandonados (itens > 24h sem reminder)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const abandonedCartItems = await prisma.cartItem.findMany({
      where: {
        createdAt: {
          lt: twentyFourHoursAgo,
        },
        reminderSentAt: null,
      },
      include: {
        cart: {
          include: {
            user: true,
          }
        }
      }
    });

    // Agrupar por usuário
    const usersToRemind = new Map<string, { email: string, cartItemIds: string[] }>();
    
    abandonedCartItems.forEach(item => {
      const userId = item.cart.userId;
      if (!usersToRemind.has(userId)) {
        usersToRemind.set(userId, { email: item.cart.user.email, cartItemIds: [] });
      }
      usersToRemind.get(userId)?.cartItemIds.push(item.id);
    });

    let cartsReminded = 0;
    for (const [userId, data] of Array.from(usersToRemind.entries())) {
      const sent = await sendAbandonedCartEmail(data.email);
      if (sent) {
        await prisma.cartItem.updateMany({
          where: { id: { in: data.cartItemIds } },
          data: { reminderSentAt: new Date() }
        });
        cartsReminded++;
      }
    }

    // 2. Reengajamento (> 60 dias inativo)
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const inactiveUsers = await prisma.user.findMany({
      where: {
        OR: [
          { lastLoginAt: { lt: sixtyDaysAgo } },
          { lastLoginAt: null, createdAt: { lt: sixtyDaysAgo } }
        ],
        AND: [
          {
            OR: [
              { reengagementEmailSentAt: null },
              { reengagementEmailSentAt: { lt: sixtyDaysAgo } }
            ]
          }
        ]
      }
    });

    let usersReengaged = 0;
    for (const user of inactiveUsers) {
      const sent = await sendReengagementEmail(user.email);
      if (sent) {
        await prisma.user.update({
          where: { id: user.id },
          data: { reengagementEmailSentAt: new Date() }
        });
        usersReengaged++;
      }
    }

    return NextResponse.json({ success: true, cartsReminded, usersReengaged });
  } catch (error) {
    console.error("Erro no cron daily-reminders:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
