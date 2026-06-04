"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import type { Subscription, DropoffPoint } from "@/types";
import Modal from "@/components/admin/Modal";
import SubscriptionForm from "./SubscriptionForm";
import DropoffForm from "./DropoffForm";
import { createSubscription, updateSubscription, deleteSubscription, deleteDropoffPoint } from "@/lib/actions/subscriptions";

const FREQ_LABELS: Record<string, string> = { "1x_month": "1×/mois", "2x_month": "2×/mois", "4x_month": "4×/mois" };
const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

interface Props { subscriptions: Subscription[] }

export default function AbonnementsClient({ subscriptions }: Props) {
  const [open, setOpen] = useState<"create" | Subscription | null>(null);
  const [dropoffOpen, setDropoffOpen] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function handleDeleteSub(id: string, name: string) {
    if (!confirm(`Supprimer l'abonnement "${name}" ? Tous les points de chute associés seront aussi supprimés.`)) return;
    startTransition(async () => { await deleteSubscription(id); });
  }

  function handleDeleteDropoff(id: string) {
    if (!confirm("Supprimer ce point de chute ?")) return;
    startTransition(async () => { await deleteDropoffPoint(id); });
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-2xl text-[#1A1A1A]">Abonnements</h1>
          <p className="text-sm opacity-50 mt-1">Gérez vos formules et points de chute ({subscriptions.length} formule{subscriptions.length !== 1 ? "s" : ""})</p>
        </div>
        <button
          onClick={() => setOpen("create")}
          className="flex items-center gap-2 font-heading font-semibold px-5 py-2.5 rounded-xl text-sm text-white hover:opacity-90 transition-all"
          style={{ backgroundColor: "#2D5016" }}
        >
          <Plus size={16} /> Nouvelle formule
        </button>
      </div>

      {subscriptions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E0D5C8] shadow-sm text-center py-16 opacity-40">
          <p className="font-heading font-semibold text-lg">Aucune formule d'abonnement</p>
        </div>
      ) : (
        <div className="space-y-4">
          {subscriptions.map((sub) => {
            const isExpanded = expanded === sub.id;
            return (
              <div key={sub.id} className="bg-white rounded-2xl border border-[#E0D5C8] shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-heading font-bold text-lg">{sub.name}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${sub.active ? "text-green-700 bg-green-100" : "text-red-600 bg-red-100"}`}>
                          {sub.active ? "Actif" : "Inactif"}
                        </span>
                      </div>
                      <p className="text-sm opacity-60 mb-2">{sub.description}</p>
                      <div className="flex gap-4 text-sm items-center flex-wrap">
                        <span className="font-bold text-lg font-display" style={{ color: "#2D5016" }}>{sub.price} $/bouquet</span>
                        <span className="opacity-60">Format {sub.format}</span>
                        <div className="flex gap-1.5 flex-wrap">
                          {(sub.frequencies ?? []).map((f) => (
                            <span key={f} className="text-xs px-2.5 py-0.5 rounded-full" style={{ backgroundColor: "#F0F5EC", color: "#2D5016" }}>{FREQ_LABELS[f] ?? f}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-4">
                      <button onClick={() => setOpen(sub)} className="p-2 rounded-xl hover:bg-[#F0F5EC] transition-colors">
                        <Pencil size={16} style={{ color: "#2D5016" }} />
                      </button>
                      <button onClick={() => handleDeleteSub(sub.id, sub.name)} className="p-2 rounded-xl hover:bg-red-50 transition-colors">
                        <Trash2 size={16} className="text-red-400" />
                      </button>
                    </div>
                  </div>

                  {/* Points de chute */}
                  <div className="mt-4 pt-4 border-t border-[#E0D5C8]">
                    <div className="flex items-center justify-between mb-2">
                      <button
                        onClick={() => setExpanded(isExpanded ? null : sub.id)}
                        className="flex items-center gap-2 text-sm font-semibold opacity-60 hover:opacity-100 transition-opacity"
                      >
                        <MapPin size={14} />
                        {(sub.dropoff_points ?? []).length} point{(sub.dropoff_points ?? []).length !== 1 ? "s" : ""} de chute
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                      <button
                        onClick={() => setDropoffOpen(sub.id)}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-80 transition-all text-white"
                        style={{ backgroundColor: "#D4A574" }}
                      >
                        <Plus size={12} /> Ajouter un point
                      </button>
                    </div>

                    {isExpanded && (sub.dropoff_points ?? []).length > 0 && (
                      <div className="space-y-2 mt-2">
                        {(sub.dropoff_points ?? []).map((dp: DropoffPoint) => (
                          <div key={dp.id} className="flex items-center justify-between px-4 py-2.5 rounded-xl" style={{ backgroundColor: "#F0F5EC" }}>
                            <div>
                              <p className="text-sm font-semibold">{dp.name}</p>
                              <p className="text-xs opacity-60">{dp.address} · {dp.hours_start}–{dp.hours_end}</p>
                              <p className="text-xs opacity-50 mt-0.5">
                                {(dp.days_available ?? []).map((d: number) => DAYS[d]).join(", ")}
                              </p>
                            </div>
                            <button onClick={() => handleDeleteDropoff(dp.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors ml-4">
                              <Trash2 size={13} className="text-red-400" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {open === "create" && (
        <Modal title="Nouvelle formule" onClose={() => setOpen(null)}>
          <SubscriptionForm action={createSubscription} onSuccess={() => setOpen(null)} />
        </Modal>
      )}

      {open && open !== "create" && (
        <Modal title={`Modifier — ${open.name}`} onClose={() => setOpen(null)}>
          <SubscriptionForm action={updateSubscription} subscription={open} onSuccess={() => setOpen(null)} />
        </Modal>
      )}

      {dropoffOpen && (
        <Modal title="Ajouter un point de chute" onClose={() => setDropoffOpen(null)} size="sm">
          <DropoffForm subscriptionId={dropoffOpen} onSuccess={() => setDropoffOpen(null)} />
        </Modal>
      )}
    </>
  );
}
