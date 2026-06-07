import { DollarSign, Users, Package, MessageSquare, Eye, Mail } from "lucide-react";
import Link from "next/link";
import DashboardCard from "@/components/admin/DashboardCard";
import { createAdminClient } from "@/lib/supabase-server";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

const STATUS_STYLES: Record<string, string> = {
  pending:   "bg-yellow-100 text-yellow-700",
  paid:      "bg-green-100 text-green-700",
  shipped:   "bg-blue-100 text-blue-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-600",
};
const STATUS_LABELS: Record<string, string> = {
  pending: "En attente", paid: "Payé", shipped: "Expédié", delivered: "Livré", cancelled: "Annulé",
};

export default async function AdminDashboard() {
  const supabase = createAdminClient();
  const now      = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    { data: ordersMonth },
    { data: products },
    { data: recentOrders },
    { data: messages },
    resNewsletter,
  ] = await Promise.all([
    supabase.from("orders").select("total_amount, round_up_amount, status").gte("created_at", firstDay),
    supabase.from("products").select("id, stock").eq("active", true),
    supabase.from("orders").select("id, customer_name, total_amount, status, created_at")
      .order("created_at", { ascending: false }).limit(5),
    supabase.from("contact_messages").select("id").eq("read", false),
    supabase.from("newsletter_subscribers").select("*", { count: "exact", head: true }),
  ]);

  const revenueMonth  = (ordersMonth ?? [])
    .filter((o) => o.status !== "cancelled")
    .reduce((acc, o) => acc + (o.total_amount ?? 0) - (o.round_up_amount ?? 0), 0);
  const ordersCount     = (ordersMonth ?? []).filter((o) => o.status !== "cancelled").length;
  const productsInStock = (products ?? []).filter((p) => p.stock === null || p.stock > 0).length;
  const unreadMessages  = (messages ?? []).length;
  const newsletterCount = resNewsletter.count ?? 0;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-2xl text-[#1A1A1A]">Tableau de bord</h1>
        <p className="text-sm text-[#1A1A1A] opacity-50 mt-1">
          {now.toLocaleDateString("fr-CA", { month: "long", year: "numeric" })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <DashboardCard
          title="Revenus ce mois"
          value={`${revenueMonth.toFixed(2)} $`}
          subtitle={`${ordersCount} commande${ordersCount !== 1 ? "s" : ""} (hors dons)`}
          icon={DollarSign}
          color="green"
        />
        <DashboardCard
          title="Abonnés infolettre"
          value={newsletterCount}
          subtitle="Inscrits au total"
          icon={Mail}
          color="blue"
        />
        <DashboardCard
          title="Produits en stock"
          value={productsInStock}
          subtitle="Produits disponibles"
          icon={Package}
          color="purple"
        />
        <DashboardCard
          title="Messages non lus"
          value={unreadMessages}
          subtitle="Formulaire de contact"
          icon={MessageSquare}
          color="orange"
        />
      </div>

      {/* Commandes récentes */}
      <div className="bg-white rounded-2xl border border-[#E0D5C8] shadow-sm p-6 mb-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading font-semibold">Commandes récentes</h2>
          <Link href="/admin/commandes" className="text-sm font-medium hover:opacity-70 transition-opacity"
            style={{ color: "#2D5016" }}>Voir tout →</Link>
        </div>

        {(recentOrders ?? []).length === 0 ? (
          <div className="rounded-xl py-10 flex items-center justify-center" style={{ backgroundColor: "#F5F5F5" }}>
            <p className="text-sm opacity-40">Aucune commande pour le moment</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E0D5C8]">
                  {["Client", "Date", "Total", "Statut", ""].map((h) => (
                    <th key={h} className="text-left pb-3 font-semibold opacity-40 uppercase tracking-wider text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EDE8]">
                {(recentOrders ?? []).map((o) => (
                  <tr key={o.id} className="hover:bg-[#FAFAF8] transition-colors">
                    <td className="py-3 font-medium">{o.customer_name}</td>
                    <td className="py-3 opacity-40 text-xs">
                      {new Date(o.created_at).toLocaleDateString("fr-CA")}
                    </td>
                    <td className="py-3 font-semibold">{Number(o.total_amount).toFixed(2)} $</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[o.status] ?? ""}`}>
                        {STATUS_LABELS[o.status] ?? o.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <Link href="/admin/commandes" className="p-1.5 rounded-lg hover:bg-[#F0F5EC] transition-colors inline-flex">
                        <Eye size={14} style={{ color: "#2D5016" }} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Messages non lus */}
      {unreadMessages > 0 && (
        <div className="rounded-2xl border p-5 flex items-center justify-between gap-4"
          style={{ backgroundColor: "rgba(212,165,116,0.08)", borderColor: "rgba(212,165,116,0.3)" }}>
          <div className="flex items-center gap-3">
            <MessageSquare size={20} style={{ color: "#D4A574" }} />
            <p className="text-sm font-semibold">
              {unreadMessages} message{unreadMessages > 1 ? "s" : ""} non lu{unreadMessages > 1 ? "s" : ""} dans le formulaire de contact
            </p>
          </div>
          <Link href="/admin/messages"
            className="text-xs font-semibold px-4 py-2 rounded-xl text-white transition-all hover:opacity-90 flex-shrink-0"
            style={{ backgroundColor: "#D4A574", color: "#1A1A1A" }}>
            Voir les messages
          </Link>
        </div>
      )}
    </div>
  );
}
