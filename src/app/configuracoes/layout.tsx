import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Configurações",
  robots: { index: false, follow: false }
};

export default function ConfiguracoesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
