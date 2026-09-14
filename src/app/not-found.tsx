import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 py-20 text-center">
      <span className="text-5xl">🌿</span>
      <h1 className="mt-4 font-display text-3xl text-verde-principal sm:text-4xl">
        Essa página se perdeu no caminho
      </h1>
      <p className="mt-3 max-w-md text-sm text-verde-secundario">
        Não encontramos o que você procurava. Talvez o link esteja errado ou a página não exista mais —
        mas nossos produtos continuam por aqui, esperando por você.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-verde-principal px-6 py-2.5 text-sm text-white transition hover:opacity-90"
        >
          Voltar para a home
        </Link>
        <Link
          href="/loja"
          className="rounded-full border border-bege-claro px-6 py-2.5 text-sm text-verde-principal transition hover:bg-bege-claro"
        >
          Ir para a loja
        </Link>
      </div>
    </main>
  );
}
