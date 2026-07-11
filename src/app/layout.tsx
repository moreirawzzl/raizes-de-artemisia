import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Loader } from "@/components/Loader";
import { Providers } from "@/components/providers/Providers";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-cormorant"
});
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-montserrat"
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  title: "Raízes de Artemísia — Produção Artesanal",
  description: "Banhos de ervas, rituais e produtos artesanais feitos com respeito à natureza. Ervas, ritual, conexão.",
  openGraph: {
    title: "Raízes de Artemísia",
    description: "Produção Artesanal — Ervas, Ritual, Conexão.",
    images: ["/images/logo-full.jpg"]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${montserrat.variable}`} suppressHydrationWarning>
      <body className="font-body">
        <Providers>
          <Loader />
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
