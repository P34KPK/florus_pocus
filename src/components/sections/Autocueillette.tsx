"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Users, Ticket } from "lucide-react";
import { useCart } from "@/context/CartContext";
import type { AutocueilletteEvent } from "@/types";

interface AutocueilletteProps {
  events?: AutocueilletteEvent[];
}

const today = new Date();
today.setHours(0, 0, 0, 0);

const FIXED_SOLD = [8, 12, 20, 3, 15, 5, 0, 11, 7, 2];

function generatePlaceholderEvents(): AutocueilletteEvent[] {
  const events: AutocueilletteEvent[] = [];
  const dates = [2, 5, 9, 12, 16, 19, 23, 26, 30, 33];
  dates.forEach((offset, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    events.push({
      id: `evt-${i}`, event_date: d.toISOString().split("T")[0],
      capacity: 20, tickets_sold: FIXED_SOLD[i],
      price_per_ticket: 25, description: "Venez cueillir vos fleurs préférées dans notre champ!", active: true,
      created_at: "", updated_at: "",
    });
  });
  return events;
}

const DAYS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

export default function Autocueillette({ events }: AutocueilletteProps) {
  const { addAutocueillette, openCart } = useCart();
  const allEvents = (events && events.length > 0) ? events : generatePlaceholderEvents();
  const eventMap  = Object.fromEntries(allEvents.map((e) => [e.event_date, e]));

  const [currentDate,  setCurrentDate]  = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedEvt,  setSelectedEvt]  = useState<AutocueilletteEvent | null>(null);
  const [quantity,     setQuantity]     = useState(1);
  const [added,        setAdded]        = useState(false);

  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay   = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function getDateStr(day: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function handleAdd() {
    if (!selectedEvt) return;
    addAutocueillette({ id: selectedEvt.id, event_date: selectedEvt.event_date, price_per_ticket: selectedEvt.price_per_ticket, quantity });
    setAdded(true);
    setTimeout(() => { setAdded(false); openCart(); }, 1500);
  }

  return (
    <section id="autocueillette" className="section-padding relative" style={{ backgroundColor: "#FAFAF8", zIndex: 2 }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-3" style={{ color: "#D4A574" }}>
            À la ferme
          </p>
          <h2 className="font-heading font-bold text-4xl sm:text-5xl leading-tight" style={{ color: "#2D5016" }}>
            Viens cueillir à la ferme
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-base opacity-65">
            Une expérience unique — promenez-vous dans nos champs et créez votre propre bouquet.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Calendar */}
          <div className="lg:col-span-3 bg-white rounded-3xl shadow-sm border border-border p-6">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                className="p-2 rounded-full hover:bg-accent/30 transition-colors">
                <ChevronLeft size={18} />
              </button>
              <h3 className="font-heading font-bold text-lg">{MONTHS[month]} {year}</h3>
              <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                className="p-2 rounded-full hover:bg-accent/30 transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
              {DAYS.map((d) => (
                <div key={d} className="text-center text-xs font-semibold uppercase tracking-wider py-2 opacity-40">{d}</div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, i) => {
                if (!day) return <div key={`empty-${i}`} />;
                const dateStr = getDateStr(day);
                const event   = eventMap[dateStr];
                const hasEvent = !!event && event.active;
                const remaining = event ? event.capacity - event.tickets_sold : 0;
                const isSelected = selectedEvt?.event_date === dateStr;
                const d = new Date(dateStr); d.setHours(0, 0, 0, 0);
                const isPast = d < today;
                const isSoldOut = hasEvent && remaining <= 0;

                return (
                  <button
                    key={day}
                    disabled={!hasEvent || isPast || isSoldOut}
                    onClick={() => { setSelectedEvt(event); setQuantity(1); }}
                    className={`relative aspect-square rounded-xl flex flex-col items-center justify-center text-sm transition-all
                      ${isSelected ? "text-white scale-105 shadow-md" : ""}
                      ${hasEvent && !isPast && !isSoldOut && !isSelected ? "hover:scale-105 font-semibold cursor-pointer" : ""}
                      ${!hasEvent || isPast ? "opacity-30 cursor-default" : ""}
                      ${isSoldOut && !isPast ? "opacity-50 cursor-not-allowed" : ""}
                    `}
                    style={{
                      backgroundColor: isSelected ? "#2D5016" : hasEvent && !isPast ? "#E8F0E0" : "transparent",
                      color: isSelected ? "#fff" : hasEvent ? "#2D5016" : "#1A1A1A",
                    }}
                  >
                    <span>{day}</span>
                    {hasEvent && !isPast && (
                      <span className={`text-[9px] font-bold mt-0.5 ${isSelected ? "text-accent" : "opacity-60"}`}>
                        {isSoldOut ? "Complet" : `${remaining} dispo`}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 mt-5 pt-4 border-t border-border text-xs opacity-50">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: "#E8F0E0" }} />
                <span>Disponible</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: "#2D5016" }} />
                <span>Sélectionné</span>
              </div>
            </div>
          </div>

          {/* Event detail + booking */}
          <div className="lg:col-span-2">
            {selectedEvt ? (
              <div className="bg-white rounded-3xl shadow-sm border border-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🌻</span>
                  <div>
                    <p className="font-heading font-bold text-lg">
                      {new Date(selectedEvt.event_date + "T12:00:00").toLocaleDateString("fr-CA", { weekday: "long", month: "long", day: "numeric" })}
                    </p>
                    <p className="text-xs opacity-50">Autocueillette à la ferme</p>
                  </div>
                </div>

                {selectedEvt.description && (
                  <p className="text-sm opacity-65 mb-5 leading-relaxed">{selectedEvt.description}</p>
                )}

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="rounded-xl p-3 text-center" style={{ backgroundColor: "#F0F5EC" }}>
                    <Users size={16} className="mx-auto mb-1" style={{ color: "#2D5016" }} />
                    <p className="text-xs opacity-50">Disponibles</p>
                    <p className="font-heading font-bold" style={{ color: "#2D5016" }}>
                      {selectedEvt.capacity - selectedEvt.tickets_sold} / {selectedEvt.capacity}
                    </p>
                  </div>
                  <div className="rounded-xl p-3 text-center" style={{ backgroundColor: "#FDF5EC" }}>
                    <Ticket size={16} className="mx-auto mb-1" style={{ color: "#D4A574" }} />
                    <p className="text-xs opacity-50">Prix/billet</p>
                    <p className="font-heading font-bold" style={{ color: "#D4A574" }}>
                      {selectedEvt.price_per_ticket}$
                    </p>
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2 opacity-50">
                    Nombre de billets
                  </label>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-lg hover:bg-accent/30 transition-colors">−</button>
                    <span className="font-heading font-bold text-2xl w-8 text-center">{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(selectedEvt.capacity - selectedEvt.tickets_sold, quantity + 1))}
                      className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-lg hover:bg-accent/30 transition-colors">+</button>
                  </div>
                  <p className="text-sm mt-3 font-semibold" style={{ color: "#2D5016" }}>
                    Total: {(selectedEvt.price_per_ticket * quantity).toFixed(2)} $
                  </p>
                </div>

                <button onClick={handleAdd}
                  className="w-full font-heading font-semibold py-3.5 rounded-xl text-sm text-white transition-all hover:opacity-90 hover:scale-[1.02]"
                  style={{ backgroundColor: "#2D5016" }}>
                  {added ? "✓ Ajouté !" : "Réserver ma place"}
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-sm border border-border p-8 text-center h-full flex flex-col items-center justify-center min-h-[300px]">
                <span className="text-5xl mb-4">📅</span>
                <p className="font-heading font-semibold text-lg opacity-50">Sélectionnez une date</p>
                <p className="text-sm opacity-40 mt-1">Les dates en vert sont disponibles</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
