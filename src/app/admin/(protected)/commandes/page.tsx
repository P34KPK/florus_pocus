import { Eye, Download } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Commandes" };

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

const PLACEHOLDER_ORDERS = [
  { id: "ORD-001", customer: "Marie Tremblay", email: "marie@example.com", date: "2026-05-15", total: 65, status: "paid" },
  { id: "ORD-002", customer: "Pierre Gagnon",  email: "pierre@example.com", date: "2026-05-14", total: 39, status: "shipped" },
  { id: "ORD-003", customer: "Sophie Lavoie",  email: "sophie@example.com", date: "2026-05-13", total: 95, status: "pending" },
];

export default function AdminCommandesPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-2xl">Commandes</h1>
          <p className="text-sm opacity-50 mt-1">Gérez et suivez toutes les commandes</p>
        </div>
        <button className="flex items-center gap-2 font-heading font-semibold px-5 py-2.5 rounded-xl text-sm border border-[#E0D5C8] bg-white hover:bg-[#F0F5EC] transition-all">
          <Download size={16} /> Exporter CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["Tous", "En attente", "Payé", "Expédié", "Livré", "Annulé"].map((f) => (
          <button key={f} className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${f === "Tous" ? "text-white" : "bg-white border border-[#E0D5C8] hover:bg-[#F0F5EC]"}`}
            style={f === "Tous" ? { backgroundColor: "#2D5016" } : {}}>
            {f}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#E0D5C8] shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead style={{ backgroundColor: "#F5F5F5" }}>
            <tr>
              {["ID", "Client", "Date", "Total", "Statut", "Actions"].map((h) => (
                <th key={h} className="text-left px-6 py-4 font-semibold opacity-50 uppercase tracking-wider text-xs">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E0D5C8]">
            {PLACEHOLDER_ORDERS.map((order) => (
              <tr key={order.id} className="hover:bg-[#FAFAF8] transition-colors">
                <td className="px-6 py-4">
                  <code className="text-xs font-mono font-semibold" style={{ color: "#2D5016" }}>{order.id}</code>
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium">{order.customer}</p>
                  <p className="text-xs opacity-40">{order.email}</p>
                </td>
                <td className="px-6 py-4 opacity-50 text-xs">
                  {new Date(order.date).toLocaleDateString("fr-CA")}
                </td>
                <td className="px-6 py-4 font-semibold">{order.total.toFixed(2)} $</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[order.status]}`}>
                    {STATUS_LABELS[order.status]}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="p-1.5 rounded-lg hover:bg-[#F0F5EC] transition-colors"><Eye size={15} style={{ color: "#2D5016" }} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
