import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";

export default async function AdminAtividadesPage() {
  const user = await requireUser();
  
  if ((user as any).role !== "ADMIN") {
    redirect("/");
  }

  const logs = await prisma.adminLog.findMany({
    include: {
      admin: { select: { username: true, avatarUrl: true } }
    },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  const actionLabels: Record<string, string> = {
    BAN_USER: "🚫 Baniu usuário",
    UNBAN_USER: "✅ Desbaniu usuário",
    PROMOTE_ADMIN: "👑 Promoveu para admin",
    DEMOTE_ADMIN: "👤 Removeu role admin",
    CONFIRM_ORDER: "✅ Confirmou pedido",
    DELIVER_ORDER: "📦 Finalizou entrega",
    CANCEL_ORDER: "❌ Cancelou pedido",
    REOPEN_ORDER: "🔄 Reabreur pedido"
  };

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-8 font-display text-4xl text-verde-principal">Atividades de Admins</h1>
      
      <div className="overflow-x-auto rounded-xl2 border border-bege-claro bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-bege-claro bg-fundo">
            <tr>
              <th className="px-4 py-3 text-left text-verde-principal">Admin</th>
              <th className="px-4 py-3 text-left text-verde-principal">Ação</th>
              <th className="px-4 py-3 text-left text-verde-principal">Detalhes</th>
              <th className="px-4 py-3 text-left text-verde-principal">Data/Hora</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-bege-claro">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-bege-escuro">
                  Nenhuma atividade registrada
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-fundo transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {log.admin.avatarUrl && (
                        <img src={log.admin.avatarUrl} alt="" className="h-6 w-6 rounded-full" />
                      )}
                      <span className="font-medium text-verde-principal">{log.admin.username}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {actionLabels[log.action] || log.action}
                  </td>
                  <td className="px-4 py-3 text-bege-escuro text-xs">
                    {log.details || "—"}
                  </td>
                  <td className="px-4 py-3 text-bege-escuro text-xs">
                    {new Date(log.createdAt).toLocaleString("pt-BR")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
