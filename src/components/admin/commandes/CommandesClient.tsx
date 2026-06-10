"use client";

import { useState, useMemo, useTransition } from "react";
import { Eye, Download, Mail, Phone, MapPin, Package, Store, Truck } from "lucide-react";
import type { Order, OrderStatus } from "@/types";
import { updateOrderStatus } from "@/lib/actions/orders";
import Modal from "@/components/admin/Modal";

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
const PAYMENT_LABELS: Record<string, string> = {
  pending: "En attente", completed: "Payé", failed: "Échoué",
};
const STATUSES: OrderStatus[] = ["pending", "paid", "shipped", "delivered", "cancelled"];
const FILTERS = ["Tous", ...STATUSES] as const;

function ref(id: string) {
  return id.slice(0, 8).toUpperCase();
}

export default function CommandesClient({ orders }: { orders: Order[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Tous");
  const [selected, setSelected] = useState<Order | null>(null);
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(
    () => (filter === "Tous" ? orders : orders.filter((o) => o.status === filter)),
    [orders, filter]
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { Tous: orders.length };
    for (const s of STATUSES) c[s] = orders.filter((o) => o.status === s).length;
    return c;
  }, [orders]);

  function handleStatusChange(order: Order, status: string) {
    startTransition(() => {
      updateOrderStatus(order.id, status);
      setSelected((prev) => (prev ? { ...prev, status: status as OrderStatus } : prev));
    });
  }

  function exportCSV() {
    const headers = ["Référence", "Date", "Client", "Courriel", "Téléphone", "Mode", "Adresse", "Total", "Statut", "Paiement"];
    const rows = filtered.map((o) => [
      ref(o.id),
      new Date(o.created_at).toLocaleDateString("fr-CA"),
      o.customer_name,
      o.customer_email,
      o.customer_phone ?? "",
      o.delivery_method === "pickup" ? "Ramassage" : "Livraison",
      o.delivery_method === "pickup" ? "Ramassage à la ferme" : o.customer_address,
      o.total_amount.toFixed(2),
      STATUS_LABELS[o.status] ?? o.status,
      PAYMENT_LABELS[o.payment_status] ?? o.payment_status,
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `commandes-floruspocus-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-2xl" style={{ color: "#2D5016" }}>Commandes</h1>
          <p className="text-sm opacity-50 mt-1">{orders.length} commande{orders.length !== 1 ? "s" : ""} au total</p>
        </div>
        <button
          onClick={exportCSV}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 font-heading font-semibold px-5 py-2.5 rounded-xl text-sm border border-[#E0D5C8] bg-white hover:bg-[#F0F5EC] transition-all disabled:opacity-40"
        >
          <Download size={16} /> Exporter CSV
        </button>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-all border"
            style={filter === f
              ? { backgroundColor: "#2D5016", color: "#fff", borderColor: "#2D5016" }
              : { backgroundColor: "#fff", color: "#1A1A1A", borderColor: "#E0D5C8" }}
          >
            {f === "Tous" ? "Tous" : STATUS_LABELS[f]} ({counts[f] ?? 0})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border-2 border-dashed border-[#E0D5C8]">
          <Package size={32} className="mx-auto mb-3 opacity-30" />
          <p className="font-heading text-lg opacity-50">Aucune commande{filter !== "Tous" ? " dans ce statut" : ""}.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E0D5C8] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ backgroundColor: "#F5F5F5" }}>
                <tr>
                  {["Réf.", "Client", "Date", "Total", "Paiement", "Statut", ""].map((h) => (
                    <th key={h} className="text-left px-6 py-4 font-semibold opacity-50 uppercase tracking-wider text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0D5C8]">
                {filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-[#FAFAF8] transition-colors cursor-pointer" onClick={() => setSelected(o)}>
                    <td className="px-6 py-4">
                      <code className="text-xs font-mono font-semibold" style={{ color: "#2D5016" }}>#{ref(o.id)}</code>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{o.customer_name}</p>
                      <p className="text-xs opacity-40">{o.customer_email}</p>
                    </td>
                    <td className="px-6 py-4 opacity-50 text-xs">{new Date(o.created_at).toLocaleDateString("fr-CA")}</td>
                    <td className="px-6 py-4 font-semibold">{Number(o.total_amount).toFixed(2)} $</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${o.payment_status === "completed" ? "bg-green-100 text-green-700" : o.payment_status === "failed" ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-700"}`}>
                        {PAYMENT_LABELS[o.payment_status] ?? o.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[o.status] ?? ""}`}>
                        {STATUS_LABELS[o.status] ?? o.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={(e) => { e.stopPropagation(); setSelected(o); }} className="p-1.5 rounded-lg hover:bg-[#F0F5EC] transition-colors">
                        <Eye size={15} style={{ color: "#2D5016" }} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <Modal title={`Commande #${ref(selected.id)}`} onClose={() => setSelected(null)} size="md">
          <div className="space-y-6">
            {/* Infos client */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide opacity-50 mb-3">Client</h3>
              <div className="space-y-2 text-sm">
                <p className="font-medium">{selected.customer_name}</p>
                <p className="flex items-center gap-2"><Mail size={14} style={{ color: "#2D5016" }} /> <a href={`mailto:${selected.customer_email}`} className="hover:underline" style={{ color: "#2D5016" }}>{selected.customer_email}</a></p>
                {selected.customer_phone && <p className="flex items-center gap-2"><Phone size={14} style={{ color: "#2D5016" }} /> <a href={`tel:${selected.customer_phone.replace(/[^\d+]/g, "")}`} className="hover:underline" style={{ color: "#2D5016" }}>{selected.customer_phone}</a></p>}
                <p className="flex items-center gap-2 font-medium">
                  {selected.delivery_method === "pickup"
                    ? <><Store size={14} style={{ color: "#2D5016" }} /> Ramassage à la ferme</>
                    : <><Truck size={14} style={{ color: "#2D5016" }} /> Livraison locale</>}
                </p>
                {selected.delivery_method === "delivery" && (
                  <p className="flex items-start gap-2"><MapPin size={14} style={{ color: "#2D5016", marginTop: 2 }} /> {selected.customer_address}</p>
                )}
              </div>
            </div>

            {/* Articles */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide opacity-50 mb-3">Articles</h3>
              <div className="space-y-2">
                {(selected.items ?? []).map((it) => (
                  <div key={it.id} className="flex items-center justify-between text-sm border border-[#E0D5C8] rounded-xl px-4 py-2.5">
                    <span>
                      {it.metadata?.product_name ?? it.metadata?.subscription_name ?? "Article"}
                      {it.quantity > 1 && <span className="opacity-50"> ×{it.quantity}</span>}
                      {it.metadata?.dropoff_point_name && <span className="block text-xs opacity-50">Point de chute : {it.metadata.dropoff_point_name}</span>}
                    </span>
                    <span className="font-semibold" style={{ color: "#2D5016" }}>{(it.price_per_unit * it.quantity).toFixed(2)} $</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2 font-bold">
                  <span>Total</span>
                  <span style={{ color: "#2D5016" }}>{Number(selected.total_amount).toFixed(2)} $</span>
                </div>
              </div>
            </div>

            {selected.notes && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide opacity-50 mb-2">Note du client</h3>
                <p className="text-sm bg-[#FAFAF8] border border-[#E0D5C8] rounded-xl px-4 py-3 whitespace-pre-wrap">{selected.notes}</p>
              </div>
            )}

            {/* Paiement + statut */}
            <div className="flex items-center gap-6 flex-wrap">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide opacity-50 mb-2">Paiement</h3>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${selected.payment_status === "completed" ? "bg-green-100 text-green-700" : selected.payment_status === "failed" ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-700"}`}>
                  {PAYMENT_LABELS[selected.payment_status] ?? selected.payment_status}
                </span>
              </div>
              <div className="flex-1 min-w-[180px]">
                <h3 className="text-xs font-semibold uppercase tracking-wide opacity-50 mb-2">Statut de la commande</h3>
                <select
                  value={selected.status}
                  disabled={pending}
                  onChange={(e) => handleStatusChange(selected, e.target.value)}
                  className="w-full border border-[#E0D5C8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#2D5016] disabled:opacity-50"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
              </div>
            </div>

            <p className="text-xs opacity-40">
              Reçue le {new Date(selected.created_at).toLocaleDateString("fr-CA", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              {selected.square_payment_id && ` · Square : ${selected.square_payment_id}`}
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
