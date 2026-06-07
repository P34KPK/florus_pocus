import type { Metadata } from "next";
import { DM_Sans, Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { SITE_URL } from "@/lib/site";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  style: ["normal"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Florus Pocus — Horticulture & Fleurs au Québec",
    template: "%s | Florus Pocus",
  },
  description:
    "Entreprise horticole au Québec. Fleurs coupées pour fleuristes et événements, approvisionnement local auprès de producteurs et accompagnement horticole. En équilibre entre la nature, la table et le quotidien.",
  keywords: ["fleurs", "horticulture", "fleurs coupées", "approvisionnement local", "accompagnement horticole", "fleuriste", "producteurs locaux", "comestibles", "Québec", "Pont-Rouge"],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fr_CA",
    siteName: "Florus Pocus",
    url: SITE_URL,
    title: "Florus Pocus — Horticulture & Fleurs au Québec",
    description:
      "Fleurs coupées pour fleuristes, approvisionnement local et accompagnement horticole. Se reconnecter avec la nature, la culture alimentaire et la beauté des jardins.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Florus Pocus — Horticulture & Fleurs au Québec",
    description: "Entreprise horticole au Québec — fleurs coupées, approvisionnement local et accompagnement horticole.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${dmSans.variable} ${inter.variable} ${cormorant.variable}`}>
      <body className="min-h-screen flex flex-col" style={{ backgroundColor: "#FAFAF8" }}>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
