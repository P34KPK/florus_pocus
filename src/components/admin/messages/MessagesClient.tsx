"use client";

import { useState, useTransition } from "react";
import { Mail, MailOpen, Trash2, CornerUpLeft } from "lucide-react";
import { markMessageRead, deleteMessage } from "@/lib/actions/messages";
import type { ContactMessage } from "@/app/admin/(protected)/messages/page";

interface Props { messages: ContactMessage[] }

export default function MessagesClient({ messages }: Props) {
  const [pending, startTransition] = useTransition();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filtered = filter === "unread" ? messages.filter((m) => !m.read) : messages;
  const unreadCount = messages.filter((m) => !m.read).length;

  function handleToggleRead(m: ContactMessage) {
    startTransition(() => { markMessageRead(m.id, !m.read); });
  }

  function handleDelete(id: string) {
    if (!confirm("Supprimer ce message ?")) return;
    startTransition(() => { deleteMessage(id); });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading font-bold text-2xl" style={{ color: "#2D5016" }}>Messages</h1>
          <p className="text-sm opacity-60 mt-1">
            Messages reçus via le formulaire de contact
            {unreadCount > 0 && ` — ${unreadCount} non lu${unreadCount > 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex gap-2">
          {(["all", "unread"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-xl text-xs font-semibold transition-all border"
              style={filter === f
                ? { backgroundColor: "#2D5016", color: "#fff", borderColor: "#2D5016" }
                : { backgroundColor: "#fff", color: "#1A1A1A", borderColor: "#E0D5C8" }}
            >
              {f === "all" ? "Tous" : "Non lus"}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border-2 border-dashed border-[#E0D5C8]">
          <Mail size={32} className="mx-auto mb-3 opacity-30" />
          <p className="font-heading text-lg opacity-50">
            {filter === "unread" ? "Aucun message non lu." : "Aucun message pour l'instant."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-2xl border shadow-sm p-5"
              style={{ borderColor: m.read ? "#E0D5C8" : "#2D5016" }}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  {!m.read && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: "#2D5016" }} />}
                  <div className="min-w-0">
                    <p className="font-heading font-bold truncate">{m.name}</p>
                    <a href={`mailto:${m.email}`} className="text-sm truncate hover:underline" style={{ color: "#2D5016" }}>
                      {m.email}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-xs opacity-40 mr-2">
                    {new Date(m.created_at).toLocaleDateString("fr-CA", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  <a
                    href={`mailto:${m.email}?subject=Re: votre message — Florus Pocus`}
                    title="Répondre"
                    className="p-2 rounded-lg hover:bg-[#F0F5EC] transition-colors"
                  >
                    <CornerUpLeft size={15} style={{ color: "#2D5016" }} />
                  </a>
                  <button
                    onClick={() => handleToggleRead(m)}
                    disabled={pending}
                    title={m.read ? "Marquer non lu" : "Marquer lu"}
                    className="p-2 rounded-lg hover:bg-[#F0F5EC] transition-colors disabled:opacity-50"
                  >
                    {m.read ? <MailOpen size={15} style={{ color: "#999" }} /> : <Mail size={15} style={{ color: "#2D5016" }} />}
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    disabled={pending}
                    title="Supprimer"
                    className="p-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={15} className="text-red-500" />
                  </button>
                </div>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "#444" }}>
                {m.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
