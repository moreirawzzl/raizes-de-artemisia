import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Criar conta",
  description: "Crie sua conta na Raízes de Artemísia para comprar, favoritar produtos e acompanhar seus pedidos."
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
