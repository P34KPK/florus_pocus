import Navbar          from "@/components/Navbar";
import Footer          from "@/components/Footer";
import CartDrawer      from "@/components/CartDrawer";
import BotanicalLayers from "@/components/BotanicalLayers";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BotanicalLayers />
      <Navbar />
      {children}
      <Footer />
      <CartDrawer />
    </>
  );
}
