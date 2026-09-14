import { prisma } from "@/lib/prisma";
import { UsersManager } from "@/components/admin/UsersManager";

export default async function AdminUsuariosPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl text-verde-principal">Usuários</h1>
      <UsersManager
        initialUsers={users.map((u) => ({
          id: u.id,
          username: u.username,
          email: u.email,
          role: u.role,
          banned: u.banned,
          createdAt: u.createdAt.toISOString(),
          lastLoginAt: u.lastLoginAt ? u.lastLoginAt.toISOString() : null,
          lastSeenAt: u.lastSeenAt ? u.lastSeenAt.toISOString() : null
        }))}
      />
    </div>
  );
}
