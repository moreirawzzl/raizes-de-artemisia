import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/auth-helpers";
import { CartIndicator } from "./store/CartIndicator";
import { signOut } from "../../auth";

export async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-bege-claro bg-fundo/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3">

        {/* LOGO */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Image
            src="/images/monogram.jpg"
            alt="Logo"
            width={40}
            height={40}
            className="rounded-full object-contain"
          />

          <div>
            <div className="font-display text-xl leading-none text-verde-principal">
              Raízes de Artemísia
            </div>

            <div className="font-body text-[9px] uppercase tracking-[2px] text-verde-secundario">
              Produção Artesanal
            </div>
          </div>
        </Link>

        {/* MENU */}
        <nav className="hidden items-center gap-6 whitespace-nowrap font-body text-sm text-verde-principal md:flex">
          <Link
            href="/loja"
            className="transition-colors hover:text-verde-secundario"
          >
            Loja
          </Link>

          <Link
            href="/favoritos"
            className="transition-colors hover:text-verde-secundario"
          >
            Favoritos
          </Link>

          <Link
            href="/sobre-nos"
            className="transition-colors hover:text-verde-secundario"
          >
            Sobre Nós
          </Link>

          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="transition-colors hover:text-verde-secundario"
            >
              Admin
            </Link>
          )}
        </nav>

        {/* ÁREA DO USUÁRIO */}
        <div className="flex shrink-0 items-center gap-4 font-body">
          {user ? (
            <>
              <CartIndicator />

              <Link
                href="/perfil"
                className="flex items-center gap-2"
              >
                <img
                  src={
                    (user as any).avatarUrl ||
                    (user as any).image ||
                    "/images/monogram.jpg"
                  }
                  alt=""
                  className="h-7 w-7 rounded-full border border-bege-claro object-cover"
                />

                <span className="hidden whitespace-nowrap text-xs text-verde-secundario sm:inline">
                  {user.name}
                </span>
              </Link>

              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="whitespace-nowrap text-xs text-verde-secundario underline"
                >
                  sair
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="whitespace-nowrap text-xs text-verde-secundario underline"
            >
              entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}