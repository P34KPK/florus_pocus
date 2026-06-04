"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, UtensilsCrossed, FileText,
  BookOpen, ShoppingCart, BarChart3, Settings, LogOut, Repeat2, PenLine,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin",            label: "Dashboard",  icon: LayoutDashboard },
  { href: "/admin/produits",   label: "Produits",   icon: Package },
  { href: "/admin/abonnements",label: "Abonnements",icon: Repeat2 },
  { href: "/admin/mange-moi",  label: "Mange Moi",  icon: UtensilsCrossed },
  { href: "/admin/pages",      label: "Pages",      icon: FileText },
  { href: "/admin/contenu",    label: "Contenu",    icon: PenLine },
  { href: "/admin/blog",       label: "Blog",       icon: BookOpen },
  { href: "/admin/commandes",  label: "Commandes",  icon: ShoppingCart },
  { href: "/admin/stats",      label: "Stats",      icon: BarChart3 },
  { href: "/admin/parametres", label: "Paramètres", icon: Settings },
];

interface SidebarProps {
  userEmail?: string;
}

export default function Sidebar({ userEmail }: SidebarProps) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <aside
      className="w-64 flex-shrink-0 flex flex-col h-screen sticky top-0 overflow-y-auto"
      style={{ backgroundColor: "#1F1F1F", color: "#F5F5F5" }}
    >
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden>
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <ellipse key={deg} cx="16" cy="16" rx="4.5" ry="10"
                fill="#D4A574" opacity="0.85"
                transform={`rotate(${deg} 16 16)`} />
            ))}
            <circle cx="16" cy="16" r="4" fill="#F4D4B0" />
          </svg>
          <span className="font-display font-bold text-lg tracking-tight" style={{ color: "#F5F5F5" }}>
            Florus Pocus
          </span>
        </div>
        <p className="text-xs opacity-30 mt-1 ml-9">Administration</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? "text-white"
                      : "text-white/50 hover:text-white/80 hover:bg-white/5"
                  }`}
                  style={active ? { backgroundColor: "#2D5016" } : {}}
                >
                  <Icon size={17} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User + Logout */}
      <div className="px-4 py-4 border-t border-white/10">
        {userEmail && (
          <p className="text-xs opacity-30 px-4 mb-2 truncate">{userEmail}</p>
        )}
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={17} />
            Déconnexion
          </button>
        </form>
      </div>
    </aside>
  );
}
