import Link from "next/link";
import Image from "next/image";
import { Mail } from "lucide-react";
import { getSiteSettings } from "@/lib/supabase-server";

export default async function Footer() {
  const year = new Date().getFullYear();
  const s = await getSiteSettings();

  const tagline1  = s["footer_tagline"]   ?? "Cultiver la vie, une fleur à la fois.";
  const tagline2  = s["footer_tagline2"]  ?? "Floriculture écoresponsable au Québec.";
  const email     = s["contact_email"]    ?? "info@floruspocus.com";
  const phone     = s["contact_phone"]    ?? "+1 (418) 555-1234";
  const address   = s["contact_address"]  ?? "123 Chemin de la Ferme, Pont-Rouge, QC G3H 1A1";
  const instagram = s["social_instagram"] ?? "https://www.instagram.com/florus_pocus";
  const linkedin  = s["social_linkedin"]  ?? "https://www.linkedin.com/company/floruspocus/";

  return (
    <footer style={{ backgroundColor: "#1F1F1F", color: "#F5F5F5" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <h3 className="font-heading font-bold text-xl mb-3" style={{ color: "#D4A574" }}>
              Florus Pocus
            </h3>
            <p className="text-sm leading-relaxed opacity-70">
              {tagline1}<br />{tagline2}
            </p>
            <div className="flex gap-4 mt-5">
              <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="opacity-60 hover:opacity-100 transition-opacity">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                </svg>
              </a>
              <a href={linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="opacity-60 hover:opacity-100 transition-opacity">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                  <rect x="2" y="9" width="4" height="12"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
              </a>
              <a href={`mailto:${email}`} aria-label="Email" className="opacity-60 hover:opacity-100 transition-opacity">
                <Mail size={20} />
              </a>
            </div>

            <div className="flex items-center gap-5 mt-7 opacity-70">
              <Image src="/aliments-du-qc-logo-white.webp" alt="Aliments du Québec" width={80} height={40} style={{ objectFit: "contain" }} />
              <Image src="/APFCQ-logo-white.webp" alt="APFCQ" width={72} height={40} style={{ objectFit: "contain" }} />
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-heading font-semibold mb-4 text-sm uppercase tracking-wider opacity-50">Navigation</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: "Abonnements", href: "/abonnements" },
                { label: "Mange Moi",   href: "/mange-moi" },
                { label: "Boutique",    href: "/boutique" },
                { label: "Blogue",      href: "/blog" },
                { label: "La Ferme",    href: "/la-ferme" },
                { label: "Contact",     href: "/contact" },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="opacity-60 hover:opacity-100 transition-opacity">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Coordonnées */}
          <div>
            <h4 className="font-heading font-semibold mb-4 text-sm uppercase tracking-wider opacity-50">Coordonnées</h4>
            <address className="text-sm not-italic space-y-2 opacity-60">
              <p>{address}</p>
              {phone && <p><a href={`tel:${phone.replace(/\s/g, "")}`} className="hover:opacity-100 transition-opacity">{phone}</a></p>}
              <p><a href={`mailto:${email}`} className="hover:opacity-100 transition-opacity">{email}</a></p>
            </address>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs opacity-40">
            <p>© {year} Florus Pocus. Tous droits réservés.</p>
            <div className="flex gap-6">
              <Link href="/politique-confidentialite" className="hover:opacity-100 transition-opacity">Confidentialité</Link>
              <Link href="/conditions-utilisation" className="hover:opacity-100 transition-opacity">Conditions</Link>
            </div>
          </div>

          {/* Crédit P34K */}
          <div className="flex justify-center">
            <a
              href="https://p34k.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Site conçu et développé par P34K — p34k.com"
              className="group inline-flex items-center gap-2 transition-opacity"
            >
              <span className="text-[11px] uppercase tracking-wider text-white/35 group-hover:text-white/60 transition-colors">
                Conçu &amp; développé par
              </span>
              <svg
                viewBox="0 0 551.55 158.12"
                height="15"
                fill="currentColor"
                role="img"
                aria-hidden="true"
                className="text-[#D4A574] opacity-70 group-hover:opacity-100 transition-opacity"
              >
                <path d="M31.32,0L0,126.8l126.8,31.32,31.32-126.8L31.32,0ZM79.06,125.61c-25.71,0-46.56-20.84-46.56-46.56s20.84-46.56,46.56-46.56,46.56,20.84,46.56,46.56-20.84,46.56-46.56,46.56Z" />
                <path d="M112.22,68.49h-31.09c-5.7,0-10.32,4.62-10.32,10.32v.36c0,5.7,4.62,10.32,10.32,10.32h31.09c5.7,0,10.32-4.62,10.32-10.32v-.36c0-5.7-4.62-10.32-10.32-10.32ZM112,86.49h-8.34c-3.83,0-6.94-3.11-6.94-6.94v-.12c0-3.83,3.11-6.94,6.94-6.94h8.34c3.83,0,6.94,3.11,6.94,6.94v.12c0,3.83-3.11,6.94-6.94,6.94Z" />
                <path d="M263.55,34.49v57h-50v33h-38V34.49h88ZM213.55,67.49h13v-8h-13v8Z" />
                <path d="M359.55,34.49v37.47l-7.32,7.34,7.32,7.34v37.85h-88v-25h50v-8h-50v-24h50v-8h-50v-25h88Z" />
                <path d="M401.55,34.49v48h13v-21h35v63h-35v-17h-48V34.49h35Z" />
                <path d="M546.14,34.49l-29.68,45,29.68,45h-36.28l-14.3-21.65v21.65h-38V34.49h38v21.65l14.3-21.65h36.28Z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
