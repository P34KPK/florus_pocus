import { createAdminClient } from "@/lib/supabase-server";

/**
 * Notifications de l'administration.
 *
 * Tout est DÉRIVÉ des données existantes à chaque chargement — il n'existe pas
 * de table de notifications. Conséquence voulue : une notification disparaît
 * d'elle-même dès que la situation est réglée (numéro de taxe saisi, message
 * lu, commande expédiée), sans qu'on ait à la marquer quelque part.
 *
 * Deux natures :
 *  - `action` : quelque chose à faire. Reste affiché et compté tant que ce
 *    n'est pas réglé, même après avoir ouvert la cloche.
 *  - `event`  : il s'est passé quelque chose. Compté comme non lu seulement
 *    s'il est postérieur à la dernière consultation.
 */

export type NotificationKind     = "action" | "event";
export type NotificationSeverity = "info" | "success" | "warning" | "danger";

export interface AdminNotification {
  id:          string;
  kind:        NotificationKind;
  severity:    NotificationSeverity;
  title:       string;
  description: string;
  href:        string;
  /** ISO — absent pour les actions permanentes. */
  createdAt?:  string;
}

export interface NotificationPayload {
  items:       AdminNotification[];
  unreadCount: number;
  lastSeenAt:  string | null;
}

/** Fenêtre de remontée des événements — au-delà, ce n'est plus une notification. */
const EVENT_WINDOW_DAYS = 30;

function frDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-CA", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

export async function getAdminNotifications(userId: string | null): Promise<NotificationPayload> {
  const supabase = createAdminClient();
  const since = new Date(Date.now() - EVENT_WINDOW_DAYS * 86400_000).toISOString();

  const [seenRes, settingsRes, ordersRes, messagesRes, subsRes] = await Promise.all([
    userId
      ? supabase.from("admin_notification_reads").select("last_seen_at").eq("user_id", userId).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from("site_settings").select("key, value")
      .in("key", ["taxes_enabled", "gst_number", "qst_number"]),
    supabase.from("orders")
      .select("id, customer_name, total_amount, created_at, status, payment_status, emails_sent_at, email_error, is_florist_order")
      .gte("created_at", since)
      .order("created_at", { ascending: false }),
    supabase.from("contact_messages")
      .select("id, name, created_at, read")
      .eq("read", false)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase.from("newsletter_subscribers")
      .select("id, email, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const lastSeenAt = (seenRes.data as { last_seen_at?: string } | null)?.last_seen_at ?? null;
  const settings   = Object.fromEntries(((settingsRes.data ?? []) as { key: string; value: string }[])
    .map((r) => [r.key, (r.value ?? "").trim()]));

  const orders = (ordersRes.data ?? []) as Array<{
    id: string; customer_name: string; total_amount: number; created_at: string;
    status: string; payment_status: string;
    emails_sent_at: string | null; email_error: string | null; is_florist_order: boolean;
  }>;

  const items: AdminNotification[] = [];
  const ref = (id: string) => id.slice(0, 8).toUpperCase();

  // ── ACTIONS À FAIRE ───────────────────────────────────────────────────────

  // Numéros de taxes manquants — obligatoires sur une facture au Québec.
  const taxesOn = (settings["taxes_enabled"] ?? "true").toLowerCase() !== "false";
  if (taxesOn) {
    const missing = [
      !settings["gst_number"] && "TPS",
      !settings["qst_number"] && "TVQ",
    ].filter(Boolean) as string[];

    if (missing.length) {
      items.push({
        id:       "action:tax-numbers",
        kind:     "action",
        severity: "warning",
        title:    `Numéro${missing.length > 1 ? "s" : ""} de ${missing.join(" et ")} à renseigner`,
        description:
          "Vos factures affichent les taxes sans vos numéros d'inscription. Au Québec, ils doivent figurer sur les confirmations de commande. " +
          "Ajoutez-les dans Contenu → Taxes et livraison.",
        href:     "/admin/contenu",
      });
    }
  }

  // Courriels de commande en échec — le client n'a jamais eu sa confirmation.
  const failedEmails = orders.filter((o) => o.payment_status === "completed" && o.email_error);
  if (failedEmails.length) {
    items.push({
      id:       "action:email-errors",
      kind:     "action",
      severity: "danger",
      title:    `${failedEmails.length} confirmation${failedEmails.length > 1 ? "s" : ""} de commande non envoyée${failedEmails.length > 1 ? "s" : ""}`,
      description: `L'envoi a échoué pour la commande #${ref(failedEmails[0].id)}${failedEmails.length > 1 ? " et d'autres" : ""}. Contactez ${failedEmails.length > 1 ? "ces clients" : "ce client"} directement.`,
      href:     "/admin/commandes",
    });
  }

  // Commandes payées mais pas encore traitées.
  const toProcess = orders.filter((o) => o.payment_status === "completed" && o.status === "paid");
  if (toProcess.length) {
    items.push({
      id:       "action:orders-to-process",
      kind:     "action",
      severity: "info",
      title:    `${toProcess.length} commande${toProcess.length > 1 ? "s" : ""} payée${toProcess.length > 1 ? "s" : ""} à préparer`,
      description: "Elles sont réglées et attendent d'être marquées expédiées ou livrées.",
      href:     "/admin/commandes",
    });
  }

  // Messages de contact non lus.
  const messages = (messagesRes.data ?? []) as Array<{ id: string; name: string; created_at: string }>;
  if (messages.length) {
    items.push({
      id:       "action:unread-messages",
      kind:     "action",
      severity: "info",
      title:    `${messages.length} message${messages.length > 1 ? "s" : ""} non lu${messages.length > 1 ? "s" : ""}`,
      description: `Dernier reçu de ${messages[0].name}, le ${frDate(messages[0].created_at)}.`,
      href:     "/admin/messages",
    });
  }

  // ── ÉVÉNEMENTS ────────────────────────────────────────────────────────────

  for (const o of orders.filter((x) => x.payment_status === "completed")) {
    items.push({
      id:       `event:order:${o.id}`,
      kind:     "event",
      severity: "success",
      title:    `${o.is_florist_order ? "Commande fleuriste" : "Nouvelle commande"} — ${Number(o.total_amount).toFixed(2)} $`,
      description: `#${ref(o.id)} · ${o.customer_name} · ${frDate(o.created_at)}`,
      href:     "/admin/commandes",
      createdAt: o.created_at,
    });
  }

  for (const s of (subsRes.data ?? []) as Array<{ id: string; email: string; created_at: string }>) {
    items.push({
      id:       `event:sub:${s.id}`,
      kind:     "event",
      severity: "info",
      title:    "Nouvel abonné à l'infolettre",
      description: `${s.email} · ${frDate(s.created_at)}`,
      href:     "/admin/contenu",
      createdAt: s.created_at,
    });
  }

  for (const m of messages) {
    items.push({
      id:       `event:msg:${m.id}`,
      kind:     "event",
      severity: "info",
      title:    "Nouveau message de contact",
      description: `${m.name} · ${frDate(m.created_at)}`,
      href:     "/admin/messages",
      createdAt: m.created_at,
    });
  }

  // Actions d'abord (par gravité), puis événements du plus récent au plus ancien.
  const rank: Record<NotificationSeverity, number> = { danger: 0, warning: 1, success: 2, info: 3 };
  items.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === "action" ? -1 : 1;
    if (a.kind === "action") return rank[a.severity] - rank[b.severity];
    return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
  });

  // Une action compte tant qu'elle n'est pas réglée ; un événement seulement
  // s'il est survenu depuis la dernière ouverture de la cloche.
  const unreadCount = items.filter((i) =>
    i.kind === "action" ||
    (!lastSeenAt || (i.createdAt ?? "") > lastSeenAt)
  ).length;

  return { items, unreadCount, lastSeenAt };
}
