"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { AutocueilletteEvent } from "@/types";
import Modal from "@/components/admin/Modal";
import EventForm from "./EventForm";
import { createEvent, updateEvent, deleteEvent } from "@/lib/actions/events";

interface Props { events: AutocueilletteEvent[] }

export default function AutocueilletteClient({ events }: Props) {
  const [open, setOpen] = useState<"create" | AutocueilletteEvent | null>(null);
  const [, startTransition] = useTransition();

  function handleDelete(id: string, date: string) {
    if (!confirm(`Supprimer l'événement du ${date} ? Les billets vendus ne seront pas remboursés automatiquement.`)) return;
    startTransition(async () => { await deleteEvent(id); });
  }

  function formatDate(iso: string) {
    return new Date(iso + "T12:00:00").toLocaleDateString("fr-CA", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-2xl text-[#1A1A1A]">Autocueillette</h1>
          <p className="text-sm opacity-50 mt-1">Gérez les dates et capacités ({events.length} événement{events.length !== 1 ? "s" : ""})</p>
        </div>
        <button
          onClick={() => setOpen("create")}
          className="flex items-center gap-2 font-heading font-semibold px-5 py-2.5 rounded-xl text-sm text-white hover:opacity-90 transition-all"
          style={{ backgroundColor: "#2D5016" }}
        >
          <Plus size={16} /> Nouvelle date
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[#E0D5C8] shadow-sm overflow-hidden">
        {events.length === 0 ? (
          <div className="text-center py-16 opacity-40">
            <p className="font-heading font-semibold text-lg">Aucun événement planifié</p>
            <p className="text-sm mt-1">Créez une première date d&apos;autocueillette.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ backgroundColor: "#F5F5F5" }}>
                <tr>
                  {["Date", "Capacité", "Vendus", "Restants", "Prix/billet", "Statut", "Actions"].map((h) => (
                    <th key={h} className="text-left px-6 py-4 font-semibold opacity-50 uppercase tracking-wider text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0D5C8]">
                {events.map((evt) => {
                  const remaining = evt.capacity - evt.tickets_sold;
                  const isSoldOut = remaining === 0;
                  return (
                    <tr key={evt.id} className="hover:bg-[#FAFAF8] transition-colors">
                      <td className="px-6 py-4 font-medium">{formatDate(evt.event_date)}</td>
                      <td className="px-6 py-4">{evt.capacity}</td>
                      <td className="px-6 py-4">{evt.tickets_sold}</td>
                      <td className="px-6 py-4">
                        <span className={`font-semibold ${isSoldOut ? "text-red-500" : remaining < 5 ? "text-orange-500" : "text-green-700"}`}>
                          {remaining}
                        </span>
                      </td>
                      <td className="px-6 py-4">{evt.price_per_ticket.toFixed(2)} $</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${!evt.active ? "bg-gray-100 text-gray-500" : isSoldOut ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>
                          {!evt.active ? "Inactif" : isSoldOut ? "Complet" : "Disponible"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          <button onClick={() => setOpen(evt)} className="p-1.5 rounded-lg hover:bg-[#F0F5EC] transition-colors">
                            <Pencil size={15} style={{ color: "#2D5016" }} />
                          </button>
                          <button onClick={() => handleDelete(evt.id, formatDate(evt.event_date))} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                            <Trash2 size={15} className="text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open === "create" && (
        <Modal title="Nouvelle date d'autocueillette" onClose={() => setOpen(null)} size="sm">
          <EventForm action={createEvent} onSuccess={() => setOpen(null)} />
        </Modal>
      )}

      {open && open !== "create" && (
        <Modal title={`Modifier — ${formatDate(open.event_date)}`} onClose={() => setOpen(null)} size="sm">
          <EventForm action={updateEvent} event={open} onSuccess={() => setOpen(null)} />
        </Modal>
      )}
    </>
  );
}

function formatDate(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("fr-CA", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}
