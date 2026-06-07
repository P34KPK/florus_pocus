import Navbar            from "@/components/Navbar";
import Footer            from "@/components/Footer";
import BotanicalLayers   from "@/components/BotanicalLayers";
import ClientCartDrawer  from "@/components/ClientCartDrawer";
import CookieConsent     from "@/components/CookieConsent";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BotanicalLayers />
      <Navbar />
      {children}
      <Footer />
      <ClientCartDrawer />
      <CookieConsent />
    </>
  );
}
