import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSiteSettings } from "@/lib/supabase-server";

export const metadata = {
  title: "Politique de confidentialité — Florus Pocus",
  description: "Politique de confidentialité de Florus Pocus.",
};

export default async function PolitiqueConfidentialitePage() {
  const settings = await getSiteSettings();
  const email = settings["contact_email"] || "info@floruspocus.com";
  return (
    <main className="min-h-screen pt-24 pb-24" style={{ backgroundColor: "#FAFAF8" }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium mb-10 hover:gap-3 transition-all"
          style={{ color: "#2D5016" }}
        >
          <ArrowLeft size={16} /> Retour à l&apos;accueil
        </Link>

        <p className="text-xs font-semibold uppercase tracking-[0.12em] mb-3" style={{ color: "#D4A574" }}>
          Légal
        </p>
        <h1 className="font-display font-bold mb-10" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "#2D5016" }}>
          Politique de confidentialité
        </h1>

        <div className="prose prose-sm max-w-none space-y-8" style={{ color: "#444" }}>

          <section>
            <h2 className="font-heading font-bold text-xl mb-3" style={{ color: "#1A1A1A" }}>1. Informations collectées</h2>
            <p className="leading-relaxed">
              Lors de vos achats ou de votre inscription à nos abonnements, nous collectons les informations
              nécessaires au traitement de votre commande : nom, adresse courriel, numéro de téléphone et adresse
              de livraison. Ces données sont utilisées uniquement pour honorer votre commande et vous contacter
              si nécessaire.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-xl mb-3" style={{ color: "#1A1A1A" }}>2. Utilisation des données</h2>
            <p className="leading-relaxed">
              Vos informations personnelles sont utilisées pour :
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 leading-relaxed">
              <li>Traiter et confirmer vos commandes</li>
              <li>Vous envoyer des confirmations et mises à jour par courriel</li>
              <li>Coordonner la livraison ou la cueillette</li>
              <li>Répondre à vos questions</li>
            </ul>
            <p className="leading-relaxed mt-3">
              Nous ne vendons, ne louons et ne partageons jamais vos données personnelles avec des tiers à des
              fins commerciales.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-xl mb-3" style={{ color: "#1A1A1A" }}>3. Paiements</h2>
            <p className="leading-relaxed">
              Les paiements sont traités de manière sécurisée via Square. Nous ne stockons aucune information
              de carte de crédit sur nos serveurs. Square est conforme aux normes PCI-DSS.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-xl mb-3" style={{ color: "#1A1A1A" }}>4. Cookies</h2>
            <p className="leading-relaxed">
              Notre site utilise des cookies essentiels pour maintenir votre session et votre panier d&apos;achat.
              Aucun cookie publicitaire ou de traçage tiers n&apos;est utilisé.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-xl mb-3" style={{ color: "#1A1A1A" }}>5. Conservation des données</h2>
            <p className="leading-relaxed">
              Vos données de commande sont conservées pendant 7 ans conformément aux obligations comptables
              québécoises. Vous pouvez demander la suppression de votre compte et de vos données personnelles
              en nous contactant à{" "}
              <a href={`mailto:${email}`} style={{ color: "#2D5016" }}>{email}</a>.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-xl mb-3" style={{ color: "#1A1A1A" }}>6. Vos droits</h2>
            <p className="leading-relaxed">
              Conformément à la Loi 25 (Loi sur la protection des renseignements personnels dans le secteur
              privé), vous avez le droit d&apos;accéder à vos données, de les corriger ou d&apos;en demander la
              suppression. Pour exercer ces droits, contactez-nous à{" "}
              <a href={`mailto:${email}`} style={{ color: "#2D5016" }}>{email}</a>.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-xl mb-3" style={{ color: "#1A1A1A" }}>7. Contact</h2>
            <p className="leading-relaxed">
              Pour toute question relative à cette politique :{" "}
              <a href={`mailto:${email}`} style={{ color: "#2D5016" }}>{email}</a>
            </p>
            <p className="text-sm mt-4" style={{ color: "#999" }}>Dernière mise à jour : juin 2026</p>
          </section>

        </div>
      </div>
    </main>
  );
}
