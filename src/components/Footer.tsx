import Link from "next/link";
import { Share2, Share, Mail } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

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
              Cultiver la vie, une fleur à la fois.<br />
              Ferme florale artisanale au Québec.
            </p>
            <div className="flex gap-4 mt-5">
              <a href="https://www.instagram.com/floruspocus" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="opacity-60 hover:opacity-100 transition-opacity">
                <Share2 size={20} />
              </a>
              <a href="https://www.facebook.com/floruspocus" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="opacity-60 hover:opacity-100 transition-opacity">
                <Share size={20} />
              </a>
              <a href="mailto:info@floruspocus.ca" aria-label="Email" className="opacity-60 hover:opacity-100 transition-opacity">
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-heading font-semibold mb-4 text-sm uppercase tracking-wider opacity-50">
              Navigation
            </h4>
            <ul className="space-y-2 text-sm">
              {["Abonnements", "Autocueillette", "Boutique", "Blogue", "La Ferme", "Contact"].map((label) => (
                <li key={label}>
                  <a
                    href={`#${label.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "-")}`}
                    className="opacity-60 hover:opacity-100 transition-opacity"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Infos */}
          <div>
            <h4 className="font-heading font-semibold mb-4 text-sm uppercase tracking-wider opacity-50">
              Coordonnées
            </h4>
            <address className="text-sm not-italic space-y-2 opacity-60">
              <p>123 Chemin de la Ferme<br />Pont-Rouge, QC G3H 1A1</p>
              <p><a href="tel:+14185551234" className="hover:opacity-100 transition-opacity">+1 (418) 555-1234</a></p>
              <p><a href="mailto:info@floruspocus.ca" className="hover:opacity-100 transition-opacity">info@floruspocus.ca</a></p>
            </address>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs opacity-40">
          <p>© {year} Florus Pocus. Tous droits réservés.</p>
          <div className="flex gap-6">
            <Link href="/politique-confidentialite" className="hover:opacity-100 transition-opacity">
              Confidentialité
            </Link>
            <Link href="/conditions-utilisation" className="hover:opacity-100 transition-opacity">
              Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
