"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export function UserBadge({ initialName, initialAvatarUrl }: { initialName: string; initialAvatarUrl: string | null }) {
  const { data: session } = useSession();
  const user = session?.user as any;

  // Usa o valor vindo da sessão do client assim que disponível; até lá,
  // mostra o que veio do server na primeira renderização (evita "piscar" vazio).
  const name = user?.name ?? initialName;
  const avatarUrl = user?.avatarUrl || user?.image || initialAvatarUrl || "/images/monogram.jpg";

  return (
    <Link href="/perfil" className="flex items-center gap-2">
      <Image
        src={avatarUrl}
        alt=""
        width={28}
        height={28}
        className="h-7 w-7 rounded-full border border-bege-claro object-cover"
      />
      <span className="hidden whitespace-nowrap text-xs text-verde-secundario sm:inline">{name}</span>
    </Link>
  );
}
