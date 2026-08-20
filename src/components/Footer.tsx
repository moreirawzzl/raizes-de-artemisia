import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-bege-claro bg-fundo">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-8 sm:grid-cols-3">
          {/* Marca */}
          <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/images/monogram.jpg"
                alt="Logo Raízes de Artemísia"
                width={36}
                height={36}
                className="rounded-full object-contain"
              />
              <div>
                <div className="font-display text-lg leading-none text-verde-principal">
                  Raízes de Artemísia
                </div>
                <div className="font-body text-[9px] uppercase tracking-[2px] text-verde-secundario">
                  Produção Artesanal
                </div>
              </div>
            </Link>
            <p className="text-xs leading-relaxed text-bege-escuro">
              Banhos de ervas, rituais e produtos artesanais feitos com respeito à natureza.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="mb-3 text-[10px] font-medium uppercase tracking-[2px] text-verde-secundario">
              Navegação
            </p>
            <ul className="space-y-2 text-sm text-verde-principal">
              <li>
                <Link href="/loja" className="transition-colors hover:text-verde-secundario">
                  Loja
                </Link>
              </li>
              <li>
                <Link href="/favoritos" className="transition-colors hover:text-verde-secundario">
                  Favoritos
                </Link>
              </li>
              <li>
                <Link href="/perfil" className="transition-colors hover:text-verde-secundario">
                  Minha conta
                </Link>
              </li>
              <li>
                <Link href="/chat" className="transition-colors hover:text-verde-secundario">
                  Fale conosco
                </Link>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <p className="mb-3 text-[10px] font-medium uppercase tracking-[2px] text-verde-secundario">
              Contato
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://instagram.com/raizesdeartemisia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-verde-principal transition-colors hover:text-verde-secundario"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                  @raizesdeartemisia
                </a>
              </li>
              <li>
                <a
                  href="tel:+5511978002279"
                  className="flex items-center gap-2 text-verde-principal transition-colors hover:text-verde-secundario"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.56a16 16 0 0 0 6.29 6.29l.87-.87a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  +55 11 97800-2279
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-bege-claro pt-6 text-center text-[11px] text-bege-escuro">
          © {new Date().getFullYear()} Raízes de Artemísia — Todos os direitos reservados
        </div>
      </div>
    </footer>
  );
}
