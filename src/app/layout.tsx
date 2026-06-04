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
    default: "Florus Pocus — Fleurs de la ferme au Québec",
    template: "%s | Florus Pocus",
  },
  description:
    "Cultiver la Vie! Fleurs fraîches cultivées à la ferme : abonnements de bouquets, créations comestibles et produits transformés. Floriculture écoresponsable, livraison locale au Québec.",
  keywords: ["fleurs", "ferme florale", "abonnement floral", "bouquets", "fleurs comestibles", "fleuriste", "Québec", "Pont-Rouge", "écoresponsable"],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fr_CA",
    siteName: "Florus Pocus",
    url: SITE_URL,
    title: "Florus Pocus — Fleurs de la ferme au Québec",
    description:
      "Fleurs fraîches cultivées à la ferme : abonnements de bouquets, créations comestibles et produits transformés. Livraison locale au Québec.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Florus Pocus — Fleurs de la ferme au Québec",
    description: "Floriculture écoresponsable au Québec — abonnements, bouquets et créations comestibles.",
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
