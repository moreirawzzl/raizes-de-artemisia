import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/auth-helpers";
import { CartIndicator } from "./store/CartIndicator";
import { signOut } from "../../auth";

export async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 border-b border-bege-claro bg-fundo/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/images/monogram.jpg" alt="Logo" width={40} height={40} className="rounded-full object-contain" />
          <div>
            <div className="font-display text-xl leading-none text-verde-principal">Raízes de Artemísia</div>
            <div className="text-[9px] tracking-[2px] uppercase text-verde-secundario font-body">Produção Artesanal</div>
          </div>
        </Link>

        <nav className="hidden gap-6 text-sm text-verde-principal font-body md:flex">
          <Link href="/loja" className="hover:text-verde-secundario">Loja</Link>
          <Link href="/favoritos" className="hover:text-verde-secundario">Favoritos</Link>
          {user?.role === "ADMIN" && <Link href="/admin" className="hover:text-verde-secundario">Admin</Link>}
        </nav>

        <div className="flex items-center gap-4 font-body">
          {user ? (
            <>
              <CartIndicator />
              <Link href="/perfil" className="flex items-center gap-2">
                <img
                  src={(user as any).avatarUrl || (user as any).image || "/images/monogram.jpg"}
                  alt=""
                  className="h-7 w-7 rounded-full border border-bege-claro object-cover"
                />
                <span className="hidden text-xs text-verde-secundario sm:inline">{user.name}</span>
              </Link>
              <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
                <button className="text-xs text-verde-secundario underline">sair</button>
              </form>
            </>
          ) : (
            <Link href="/login" className="text-xs text-verde-secundario underline">entrar</Link>
          )}
        </div>
      </div>
    </header>
  );
}
