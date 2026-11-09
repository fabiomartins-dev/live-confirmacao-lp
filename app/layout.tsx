import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });

const TITLE = "O mundo pós-trabalho: qual será o seu lugar? | Autonomous Economy";
const DESCRIPTION =
  "Participe da live do Autonomous Economy sobre como os agentes de IA podem transformar o trabalho, a renda e os negócios. Confirme sua presença.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website", locale: "pt_BR", siteName: "Autonomous Economy" },
  twitter: { card: "summary", title: TITLE, description: DESCRIPTION },
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
