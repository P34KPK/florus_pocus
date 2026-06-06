import type { Metadata } from "next";
import { CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import PasswordForm from "@/components/admin/parametres/PasswordForm";

export const metadata: Metadata = { title: "Paramètres" };

function ServiceBadge({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#F0EBE4] last:border-0">
      <span className="text-sm">{label}</span>
      {ok
        ? <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700"><CheckCircle2 size={14} /> Configuré</span>
        : <span className="flex items-center gap-1.5 text-xs font-semibold text-red-500"><XCircle size={14} /> Manquant</span>
      }
    </div>
  );
}

const QUICK_LINKS = [
  { label: "Supabase — Base de données",  href: "https://supabase.com/dashboard/project/msxyptzedflnfbtbvrwi" },
  { label: "Square — Paiements",          href: "https://squareup.com/dashboard" },
  { label: "Vercel — Déploiements",       href: "https://vercel.com/dashboard" },
  { label: "Resend — Emails",             href: "https://resend.com/emails" },
  { label: "Upstash — Redis (rate limit)",href: "https://console.upstash.com" },
];

export default function AdminParametresPage() {
  const services = [
    { label: "Square Paiements",   ok: !!process.env.SQUARE_SECRET_API_KEY },
    { label: "Square Webhook",     ok: !!process.env.SQUARE_WEBHOOK_SIGNATURE_KEY },
    { label: "Resend (emails)",    ok: !!process.env.RESEND_API_KEY },
    { label: "Upstash Redis",      ok: !!process.env.UPSTASH_REDIS_REST_URL },
    { label: "Supabase Service",   ok: !!process.env.SUPABASE_SERVICE_ROLE_KEY },
  ];

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-2xl">Paramètres</h1>
        <p className="text-sm opacity-50 mt-1">Compte administrateur et état des services</p>
      </div>

      <div className="space-y-6">

        {/* Mot de passe */}
        <div className="bg-white rounded-2xl border border-[#E0D5C8] shadow-sm p-6">
          <h2 className="font-heading font-semibold text-lg mb-1">Compte administrateur</h2>
          <p className="text-sm opacity-50 mb-5">Modifier le mot de passe de connexion admin.</p>
          <PasswordForm />
        </div>

        {/* Services */}
        <div className="bg-white rounded-2xl border border-[#E0D5C8] shadow-sm p-6">
          <h2 className="font-heading font-semibold text-lg mb-1">Services connectés</h2>
          <p className="text-sm opacity-50 mb-4">
            Variables d&apos;environnement critiques — configurées sur Vercel.
          </p>
          <div>
            {services.map((s) => (
              <ServiceBadge key={s.label} label={s.label} ok={s.ok} />
            ))}
          </div>
          <p className="text-xs opacity-40 mt-4">
            Pour modifier ces clés : Vercel → Settings → Environment Variables.
          </p>
        </div>

        {/* Accès rapides */}
        <div className="bg-white rounded-2xl border border-[#E0D5C8] shadow-sm p-6">
          <h2 className="font-heading font-semibold text-lg mb-1">Accès rapides</h2>
          <p className="text-sm opacity-50 mb-4">Tableaux de bord des services externes.</p>
          <div className="space-y-2">
            {QUICK_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-4 py-3 rounded-xl border border-[#E0D5C8] hover:border-[#2D5016] hover:bg-[#F0F5EC] transition-all group"
              >
                <span className="text-sm font-medium">{l.label}</span>
                <ExternalLink size={14} className="opacity-30 group-hover:opacity-70 transition-opacity" />
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
