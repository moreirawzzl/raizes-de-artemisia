import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Completar cadastro",
  robots: { index: false, follow: false }
};

export default function CompletarCadastroLayout({ children }: { children: React.ReactNode }) {
  return children;
}
