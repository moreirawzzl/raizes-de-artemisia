import { buildWhatsappGeneralUrl } from "@/lib/whatsapp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Encomendas",
  description: "Solicite uma encomenda ou tire dúvidas sobre disponibilidade direto pelo WhatsApp."
};

export default function EncomendasPage() {
  const whatsappUrl = buildWhatsappGeneralUrl("Olá! Gostaria de fazer uma encomenda na Raízes de Artemísia.");

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 py-16 text-center">
      <span className="text-4xl">🌿</span>
      <h1 className="mt-4 font-display text-3xl text-verde-principal sm:text-4xl">Encomendas</h1>
      <p className="mt-3 max-w-md text-sm text-verde-secundario">
        Para solicitar uma encomenda ou tirar dúvidas sobre disponibilidade, fale diretamente conosco pelo WhatsApp.
      </p>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 rounded-full bg-[#3d8a5f] px-6 py-2.5 text-sm text-white transition hover:bg-[#347650]"
      >
        Fazer uma encomenda
      </a>
    </main>
  );
}
