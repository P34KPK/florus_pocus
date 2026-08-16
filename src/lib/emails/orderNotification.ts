import { SITE_URL } from "@/lib/site";
import type { OrderBreakdown } from "@/lib/emails/orderConfirmation";
import { formatPrix } from "@/lib/pricing";

interface NotificationItem {
  name: string;
  quantity: number;
  price: number;
}

export interface OrderNotificationProps {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  deliveryMethod: "pickup" | "delivery";
  address: string;
  notes: string | null;
  items: NotificationItem[];
  total: number;
  roundUp: number;
  isFloristOrder: boolean;
  breakdown?: OrderBreakdown;
}

/** Lignes de ventilation à afficher au-dessus du total encaissé. */
function summaryRows(p: OrderNotificationProps): Array<[string, string]> {
  const b = p.breakdown;
  if (!b) return p.roundUp > 0 ? [["Arrondi pour la cause", `${formatPrix(p.roundUp)} $`]] : [];

  const rows: Array<[string, string]> = [["Sous-total", `${formatPrix(b.subtotal)} $`]];
  rows.push(["Livraison", b.deliveryFee > 0 ? `${formatPrix(b.deliveryFee)} $` : "Gratuite"]);
  if (b.gst > 0) rows.push(["TPS", `${formatPrix(b.gst)} $`]);
  if (b.qst > 0) rows.push(["TVQ", `${formatPrix(b.qst)} $`]);
  if (b.roundUp > 0) rows.push(["Arrondi pour la cause", `${formatPrix(b.roundUp)} $`]);
  return rows;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Courriel envoyé à l'administrateur à chaque commande payée.
 * Volontairement dense et sans fioritures : c'est un bon de travail, pas du marketing.
 */
export function orderNotificationHtml(p: OrderNotificationProps): string {
  const ref = p.orderId.slice(0, 8).toUpperCase();

  const rows = p.items.map((i) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #E0D5C8;">${escapeHtml(i.name)} ${i.quantity > 1 ? `<span style="color:#888;">×${i.quantity}</span>` : ""}</td>
      <td style="padding:8px 0;border-bottom:1px solid #E0D5C8;text-align:right;font-weight:bold;color:#2D5016;">${formatPrix((i.price * i.quantity))} $</td>
    </tr>
  `).join("");

  const modeLabel = p.deliveryMethod === "pickup" ? "Ramassage à la ferme" : "Livraison locale";

  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>Nouvelle commande #${ref}</title></head>
<body style="margin:0;padding:0;background:#FAFAF8;font-family:Georgia,serif;color:#1A1A1A;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border:1px solid #E0D5C8;border-radius:12px;overflow:hidden;">

        <tr>
          <td style="background:#2D5016;padding:28px 32px;">
            <p style="margin:0 0 6px;color:#D4A574;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Nouvelle commande payée</p>
            <h1 style="margin:0;color:#fff;font-size:24px;font-weight:normal;">#${ref}</h1>
            ${p.isFloristOrder ? `<p style="margin:10px 0 0;display:inline-block;background:#D4A574;color:#2D5016;font-size:12px;font-weight:bold;padding:4px 10px;border-radius:6px;">COMMANDE FLEURISTE — prix de gros</p>` : ""}
          </td>
        </tr>

        <tr>
          <td style="padding:28px 32px;">
            <p style="margin:0 0 10px;font-size:12px;color:#888;letter-spacing:2px;text-transform:uppercase;">Client</p>
            <p style="margin:0 0 4px;font-size:16px;"><strong>${escapeHtml(p.customerName)}</strong></p>
            <p style="margin:0 0 4px;font-size:14px;"><a href="mailto:${escapeHtml(p.customerEmail)}" style="color:#2D5016;">${escapeHtml(p.customerEmail)}</a></p>
            ${p.customerPhone ? `<p style="margin:0;font-size:14px;"><a href="tel:${escapeHtml(p.customerPhone)}" style="color:#2D5016;">${escapeHtml(p.customerPhone)}</a></p>` : ""}

            <p style="margin:24px 0 10px;font-size:12px;color:#888;letter-spacing:2px;text-transform:uppercase;">${modeLabel}</p>
            <p style="margin:0;font-size:14px;line-height:1.6;">${escapeHtml(p.address)}</p>

            ${p.notes ? `
            <p style="margin:24px 0 10px;font-size:12px;color:#888;letter-spacing:2px;text-transform:uppercase;">Note du client</p>
            <p style="margin:0;font-size:14px;line-height:1.6;white-space:pre-wrap;background:#FAFAF8;border:1px solid #E0D5C8;border-radius:8px;padding:14px;">${escapeHtml(p.notes)}</p>` : ""}

            <p style="margin:24px 0 10px;font-size:12px;color:#888;letter-spacing:2px;text-transform:uppercase;">Articles</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
              ${rows}
              ${summaryRows(p).map(([l, v]) => `
              <tr>
                <td style="padding:6px 0;color:#666;font-size:13px;">${l}</td>
                <td style="padding:6px 0;text-align:right;color:#666;font-size:13px;">${v}</td>
              </tr>`).join("")}
              <tr>
                <td style="padding:14px 0 0;font-size:16px;font-weight:bold;">Total encaissé</td>
                <td style="padding:14px 0 0;text-align:right;font-size:20px;font-weight:bold;color:#2D5016;">${formatPrix(p.total)} $</td>
              </tr>
            </table>

            <p style="margin:28px 0 0;text-align:center;">
              <a href="${SITE_URL}/admin/commandes" style="display:inline-block;background:#2D5016;color:#fff;text-decoration:none;font-size:14px;padding:12px 24px;border-radius:8px;">Ouvrir dans l'admin</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
  `.trim();
}

export function orderNotificationText(p: OrderNotificationProps): string {
  const ref = p.orderId.slice(0, 8).toUpperCase();
  const lines = p.items
    .map((i) => `  - ${i.name}${i.quantity > 1 ? ` ×${i.quantity}` : ""} : ${formatPrix((i.price * i.quantity))} $`)
    .join("\n");

  return `
NOUVELLE COMMANDE PAYÉE — #${ref}${p.isFloristOrder ? "\n*** COMMANDE FLEURISTE — prix de gros appliqués ***" : ""}

Client : ${p.customerName}
Courriel : ${p.customerEmail}
Téléphone : ${p.customerPhone ?? "—"}

${p.deliveryMethod === "pickup" ? "Ramassage à la ferme" : "Livraison locale"}
${p.address}
${p.notes ? `\nNote du client :\n${p.notes}\n` : ""}
Articles :
${lines}

${summaryRows(p).map(([l, v]) => `  ${l} : ${v}`).join("\n")}

Total encaissé : ${formatPrix(p.total)} $

Voir la commande : ${SITE_URL}/admin/commandes
  `.trim();
}
