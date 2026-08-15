"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import type { AdminNotification, NotificationSeverity } from "@/lib/notifications";
import { markNotificationsSeen } from "@/lib/actions/notifications";

const ICONS = {
  success: CheckCircle2,
  warning: AlertTriangle,
  danger:  AlertCircle,
  info:    Info,
} as const;

const COLORS: Record<NotificationSeverity, string> = {
  success: "#2D5016",
  warning: "#B7791F",
  danger:  "#C53030",
  info:    "#4A5568",
};

interface Props {
  items:       AdminNotification[];
  unreadCount: number;
  lastSeenAt:  string | null;
}

export default function NotificationBell({ items, unreadCount, lastSeenAt }: Props) {
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fermeture au clic extérieur et à Échap.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function toggle() {
    const next = !open;
    setOpen(next);
    // À l'ouverture, les événements passent en « lus ». Les actions restent.
    if (next && items.some((i) => i.kind === "event")) {
      startTransition(async () => {
        await markNotificationsSeen();
        router.refresh();
      });
    }
  }

  const actions = items.filter((i) => i.kind === "action");
  const events  = items.filter((i) => i.kind === "event");
  const isNew   = (i: AdminNotification) => !lastSeenAt || (i.createdAt ?? "") > lastSeenAt;

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={toggle}
        aria-label={`Notifications${unreadCount ? ` (${unreadCount})` : ""}`}
        className="relative p-2.5 rounded-xl border border-[#E0D5C8] bg-white hover:bg-[#F0F5EC] transition-colors"
      >
        <Bell size={18} style={{ color: "#2D5016" }} />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1.5 -right-1.5 min-w-[19px] h-[19px] px-1 rounded-full text-[11px] font-bold text-white flex items-center justify-center"
            style={{ backgroundColor: "#C53030" }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl border border-[#E0D5C8] bg-white shadow-xl z-50 overflow-hidden"
          role="dialog"
          aria-label="Notifications"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#E0D5C8]" style={{ backgroundColor: "#FAFAF8" }}>
            <span className="font-heading font-bold text-sm" style={{ color: "#2D5016" }}>Notifications</span>
            <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-[#F0F5EC]" aria-label="Fermer">
              <X size={15} className="opacity-50" />
            </button>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {items.length === 0 && (
              <p className="px-4 py-10 text-center text-sm opacity-40">
                Rien à signaler pour le moment.
              </p>
            )}

            {actions.length > 0 && (
              <>
                <p className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider opacity-40">
                  À faire
                </p>
                {actions.map((n) => <Row key={n.id} n={n} onNavigate={() => setOpen(false)} highlight />)}
              </>
            )}

            {events.length > 0 && (
              <>
                <p className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider opacity-40">
                  Activité récente
                </p>
                {events.map((n) => (
                  <Row key={n.id} n={n} onNavigate={() => setOpen(false)} highlight={isNew(n)} />
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ n, onNavigate, highlight }: { n: AdminNotification; onNavigate: () => void; highlight?: boolean }) {
  const Icon = ICONS[n.severity];
  return (
    <Link
      href={n.href}
      onClick={onNavigate}
      className="flex gap-3 px-4 py-3 hover:bg-[#FAFAF8] transition-colors border-b border-[#F0EDE8] last:border-b-0"
      style={highlight ? { backgroundColor: "rgba(45,80,22,0.035)" } : undefined}
    >
      <Icon size={16} style={{ color: COLORS[n.severity], flexShrink: 0, marginTop: 2 }} />
      <div className="min-w-0">
        <p className="text-sm font-semibold leading-snug" style={{ color: "#1A1A1A" }}>{n.title}</p>
        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "#666" }}>{n.description}</p>
      </div>
    </Link>
  );
}
