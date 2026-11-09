import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Agent Economy — encontro ao vivo",
  description:
    "Uma conversa sobre como os agentes de inteligência artificial podem transformar o trabalho, os negócios e a criação de valor. Confirme sua presença.",
};

export const viewport: Viewport = { themeColor: "#F6F5F0" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>
        {/* Sem JS, nada fica escondido à espera de animação. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}[data-draw]{transform:none!important}.gl{animation:none!important}`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
