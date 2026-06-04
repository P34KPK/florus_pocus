"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";

const navLinks = [
  { label: "Abonnements",    href: "/abonnements" },
  { label: "Boutique",       href: "/boutique" },
  { label: "Mange Moi",      href: "/mange-moi" },
  { label: "La Ferme",       href: "/la-ferme" },
  { label: "Blogue",         href: "/blog" },
  { label: "Contact",        href: "/contact" },
  { label: "Fleuristes",     href: "/fleuristes", icon: Lock },
];

export default function Navbar() {
  const pathname = usePathname();
  const isHomepage = pathname === "/";

  const { itemCount, openCart } = useCart();
  const [scrolled,   setScrolled]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navVisible, setNavVisible] = useState(!isHomepage);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Ferme le menu mobile à chaque changement de page */
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  /* Sur les pages sans Hero, la navbar est immédiatement visible */
  useEffect(() => {
    if (!isHomepage) setNavVisible(true);
  }, [isHomepage]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Logique rideau Hero — uniquement sur la homepage */
  useEffect(() => {
    if (!isHomepage) return;
    const onCurtain = (e: Event) => {
      const open = (e as CustomEvent<boolean>).detail;
      if (timerRef.current) clearTimeout(timerRef.current);
      if (open) {
        timerRef.current = setTimeout(() => setNavVisible(true), 800);
      } else {
        setNavVisible(false);
      }
    };
    window.addEventListener("hero-curtain", onCurtain);
    return () => {
      window.removeEventListener("hero-curtain", onCurtain);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isHomepage]);

  /* Sur les pages sans Hero, on traite comme si scrolled=true pour les couleurs */
  const dark = scrolled || !isHomepage;

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${
        dark
          ? "bg-white/75 backdrop-blur-xl border-b border-[#E0D5C8]/50"
          : "bg-transparent"
      }`}
      initial={{ y: "-100%" }}
      animate={navVisible ? { y: "0%" } : { y: "-100%" }}
      transition={{ type: "spring", stiffness: 120, damping: 20, mass: 0.8 }}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        <Link href="/" className="flex items-center">
          <Image
            src="/florus_pocus_logo.svg"
            alt="Florus Pocus"
            width={160}
            height={36}
            priority
            style={{ filter: dark ? "none" : "brightness(0) invert(1)" }}
          />
        </Link>

        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="relative text-sm font-medium transition-colors group flex items-center gap-1"
                style={{ color: dark ? "#1A1A1A" : "#F4D4B0" }}
              >
                {link.icon && <link.icon size={12} style={{ opacity: 0.6 }} />}
                {link.label}
                <span
                  className="absolute -bottom-0.5 left-0 w-0 h-px group-hover:w-full transition-all duration-300"
                  style={{ backgroundColor: "#D4A574" }}
                />
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <button onClick={openCart} className="relative p-2 rounded-full transition-all hover:scale-110" aria-label="Panier">
            <ShoppingBag size={22} style={{ color: dark ? "#1A1A1A" : "#fff" }} />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 text-xs font-bold rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: "#D4A574" }}>
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </button>

          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            {mobileOpen
              ? <X    size={22} style={{ color: dark ? "#1A1A1A" : "#fff" }} />
              : <Menu size={22} style={{ color: dark ? "#1A1A1A" : "#fff" }} />
            }
          </button>
        </div>
      </nav>

      {/* Menu mobile — glass sombre éditorial */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t"
            style={{
              backgroundColor: "rgba(13, 26, 5, 0.96)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              borderColor: "rgba(255,255,255,0.08)"
            }}
          >
            <ul className="flex flex-col py-6 px-6 gap-1">
              {navLinks.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.06 }}
                >
                  <Link
                    href={link.href}
                    className="block py-3 font-display font-bold leading-tight transition-colors"
                    style={{ fontSize: "clamp(1.25rem, 5vw, 1.75rem)", color: "rgba(255,255,255,0.72)" }}
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
