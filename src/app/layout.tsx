import type { Metadata } from "next";
import { DM_Sans, Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Florus Pocus — Fleurs de la ferme",
    template: "%s | Florus Pocus",
  },
  description:
    "Fleurs fraîches cultivées à la ferme. Abonnements, autocueillette et produits transformés. Livraison locale au Québec.",
  keywords: ["fleurs", "ferme", "abonnement", "autocueillette", "bouquets", "Québec"],
  openGraph: {
    type: "website",
    locale: "fr_CA",
    siteName: "Florus Pocus",
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
