import { buildWhatsappGeneralUrl } from "@/lib/whatsapp";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conta suspensa",
  robots: { index: false, follow: false }
};

export default async function BanidoPage({
  searchParams
}: {
  searchParams: Promise<{ motivo?: string }>;
}) {
  const { motivo } = await searchParams;
  const supportEmail = process.env.ADMIN_EMAIL || "contato@raizesdeartemisia.com";
  const whatsappUrl = buildWhatsappGeneralUrl("Olá! Minha conta na Raízes de Artemísia foi suspensa e gostaria de entender o motivo.");

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
      <span className="text-4xl">🚫</span>
      <h1 className="mt-4 font-display text-3xl text-verde-principal">Sua conta foi suspensa</h1>

      {motivo && (
        <div className="mt-5 w-full rounded-xl2 border border-[#e3c9bd] bg-[#F6E7E1] p-4 text-left text-sm text-[#8a4a3a]">
          <span className="block text-[11px] font-semibold uppercase tracking-wide">Motivo informado pela equipe</span>
          <p className="mt-1">{motivo}</p>
        </div>
      )}

      <p className="mt-5 text-sm text-verde-secundario">
        Se você acredita que isso foi um engano, ou quer entender melhor a situação, fale com a gente:
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-[#3d8a5f] px-6 py-2.5 text-sm text-white transition hover:bg-[#347650]"
        >
          Falar no WhatsApp
        </a>
        <a
          href={`mailto:${supportEmail}`}
          className="rounded-full border border-bege-claro px-6 py-2.5 text-sm text-verde-principal transition hover:bg-bege-claro"
        >
          {supportEmail}
        </a>
      </div>

      <Link href="/" className="mt-8 text-xs text-verde-secundario underline">Voltar para a home</Link>
    </main>
  );
}
