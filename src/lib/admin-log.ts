import { prisma } from "@/lib/prisma";

export async function logAdminAction(params: {
  adminId: string;
  action: string;
  targetUserId?: string;
  orderId?: string;
  details?: string;
}) {
  try {
    await prisma.adminLog.create({ data: params });
  } catch (err) {
    // Não deixa uma falha no log derrubar a ação principal (banir, mudar
    // status de pedido, etc.) — só registra no console do servidor.
    console.error("Falha ao gravar log de atividade de admin:", err);
  }
}
