import { formatPrix } from "@/lib/pricing";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

/** Détail fiscal de la commande. Absent = ancienne commande sans ventilation. */
export interface OrderBreakdown {
  subtotal:    number;
  deliveryFee: number;
  gst:         number;
  qst:         number;
  roundUp:     number;
  gstNumber?:  string;
  qstNumber?:  string;
}

interface OrderConfirmationProps {
  orderId: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  breakdown?: OrderBreakdown;
}

/** Lignes de ventilation communes au HTML et au texte. */
function breakdownLines(b: OrderBreakdown): Array<[string, string]> {
  const lines: Array<[string, string]> = [["Sous-total", `${formatPrix(b.subtotal)} $`]];
  lines.push(["Livraison", b.deliveryFee > 0 ? `${formatPrix(b.deliveryFee)} $` : "Gratuite"]);
  if (b.gst > 0) lines.push([b.gstNumber ? `TPS (${b.gstNumber})` : "TPS", `${formatPrix(b.gst)} $`]);
  if (b.qst > 0) lines.push([b.qstNumber ? `TVQ (${b.qstNumber})` : "TVQ", `${formatPrix(b.qst)} $`]);
  if (b.roundUp > 0) lines.push(["Arrondi pour la cause", `${formatPrix(b.roundUp)} $`]);
  return lines;
}

export function orderConfirmationHtml({ orderId, customerName, items, total, breakdown }: OrderConfirmationProps): string {
  const orderRef = orderId.slice(0, 8).toUpperCase();

  const breakdownRows = breakdown
    ? breakdownLines(breakdown).map(([label, value]) => `
        <tr>
          <td style="padding: 6px 0; font-family: Georgia, serif; color: #666; font-size: 14px;">${label}</td>
          <td style="padding: 6px 0; text-align: right; font-family: Georgia, serif; color: #666; font-size: 14px;">${value}</td>
        </tr>
      `).join("")
    : "";

  const itemsRows = items.map((item) => `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #E0D5C8; font-family: Georgia, serif; color: #1A1A1A;">
        ${item.name}${item.quantity > 1 ? ` <span style="color: #888;">×${item.quantity}</span>` : ""}
      </td>
      <td style="padding: 10px 0; border-bottom: 1px solid #E0D5C8; text-align: right; font-family: Georgia, serif; color: #2D5016; font-weight: bold;">
        ${formatPrix((item.price * item.quantity))} $
      </td>
    </tr>
  `).join("");

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmation de commande — Florus Pocus</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAFAF8; font-family: Georgia, serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAFAF8; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">

          <!-- Header -->
          <tr>
            <td style="background-color: #2D5016; padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
              <p style="margin: 0 0 8px 0; color: #D4A574; font-size: 13px; letter-spacing: 3px; text-transform: uppercase;">Confirmation de commande</p>
              <h1 style="margin: 0; color: #FAFAF8; font-size: 28px; font-weight: normal; letter-spacing: 1px;">Florus Pocus</h1>
              <p style="margin: 12px 0 0 0; color: rgba(255,255,255,0.5); font-size: 13px;">Cultiver la Vie, une fleur à la fois</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color: #FFFFFF; padding: 40px; border-left: 1px solid #E0D5C8; border-right: 1px solid #E0D5C8;">
              <p style="margin: 0 0 24px 0; font-size: 17px; color: #1A1A1A;">
                Bonjour <strong>${customerName}</strong>,
              </p>
              <p style="margin: 0 0 32px 0; font-size: 15px; color: #555; line-height: 1.7;">
                Merci pour votre commande ! Nous avons bien reçu votre paiement et votre commande est maintenant confirmée. Nous vous contacterons sous peu pour coordonner la livraison ou la cueillette.
              </p>

              <!-- Order ref -->
              <div style="background-color: #F0F5EC; border: 1px solid #D4A574; border-radius: 8px; padding: 16px 20px; margin-bottom: 32px; text-align: center;">
                <p style="margin: 0; font-size: 12px; color: #888; letter-spacing: 2px; text-transform: uppercase;">Numéro de commande</p>
                <p style="margin: 6px 0 0 0; font-size: 22px; font-weight: bold; color: #2D5016; letter-spacing: 2px;">#${orderRef}</p>
              </div>

              <!-- Items -->
              <p style="margin: 0 0 12px 0; font-size: 13px; color: #888; letter-spacing: 2px; text-transform: uppercase;">Détails de votre commande</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${itemsRows}
                ${breakdownRows ? `<tr><td colspan="2" style="padding: 10px 0 0 0;"></td></tr>${breakdownRows}` : ""}
                <tr>
                  <td style="padding: 16px 0 0 0; font-size: 16px; font-weight: bold; color: #1A1A1A; border-top: 1px solid #E0D5C8;">Total</td>
                  <td style="padding: 16px 0 0 0; text-align: right; font-size: 20px; font-weight: bold; color: #2D5016; border-top: 1px solid #E0D5C8;">${formatPrix(total)} $</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1F1F1F; padding: 28px 40px; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0 0 8px 0; color: rgba(255,255,255,0.4); font-size: 13px;">
                Des questions ? Contactez-nous à
                <a href="mailto:info@floruspocus.com" style="color: #D4A574; text-decoration: none;">info@floruspocus.com</a>
              </p>
              <p style="margin: 0; color: rgba(255,255,255,0.2); font-size: 12px;">
                © ${new Date().getFullYear()} Florus Pocus — Floriculture écoresponsable au Québec
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function orderConfirmationText({ orderId, customerName, items, total, breakdown }: OrderConfirmationProps): string {
  const orderRef = orderId.slice(0, 8).toUpperCase();
  const itemsList = items.map((i) => `  - ${i.name}${i.quantity > 1 ? ` ×${i.quantity}` : ""} : ${formatPrix((i.price * i.quantity))} $`).join("\n");
  const detail = breakdown
    ? "\n" + breakdownLines(breakdown).map(([l, v]) => `  ${l} : ${v}`).join("\n") + "\n"
    : "";

  return `
Bonjour ${customerName},

Merci pour votre commande chez Florus Pocus !

Numéro de commande : #${orderRef}

${itemsList}
${detail}
Total : ${formatPrix(total)} $

Nous vous contacterons sous peu pour coordonner la livraison ou la cueillette.

Des questions ? info@floruspocus.com

© ${new Date().getFullYear()} Florus Pocus
  `.trim();
}
