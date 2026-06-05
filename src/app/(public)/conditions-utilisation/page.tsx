import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getSiteSettings } from "@/lib/supabase-server";

export const metadata = {
  title: "Conditions d'utilisation — Florus Pocus",
  description: "Conditions générales d'utilisation et de vente de Florus Pocus.",
};

export default async function ConditionsUtilisationPage() {
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
          Conditions d&apos;utilisation
        </h1>

        <div className="prose prose-sm max-w-none space-y-8" style={{ color: "#444" }}>

          <section>
            <h2 className="font-heading font-bold text-xl mb-3" style={{ color: "#1A1A1A" }}>1. Acceptation des conditions</h2>
            <p className="leading-relaxed">
              En accédant au site floruspocus.com et en passant une commande, vous acceptez les présentes
              conditions d&apos;utilisation. Florus Pocus se réserve le droit de les modifier à tout moment.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-xl mb-3" style={{ color: "#1A1A1A" }}>2. Produits et disponibilité</h2>
            <p className="leading-relaxed">
              Nos fleurs et produits sont cultivés localement au Québec. La disponibilité varie selon les
              saisons et les conditions de culture. Florus Pocus se réserve le droit de substituer un produit
              par un équivalent de valeur égale si celui-ci n&apos;est pas disponible.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-xl mb-3" style={{ color: "#1A1A1A" }}>3. Commandes et paiements</h2>
            <p className="leading-relaxed">
              Toute commande est confirmée après réception du paiement complet. Les prix sont en dollars
              canadiens et incluent les taxes applicables. Le paiement est traité de façon sécurisée via
              Square.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-xl mb-3" style={{ color: "#1A1A1A" }}>4. Livraison et cueillette</h2>
            <p className="leading-relaxed">
              Après confirmation de votre commande, nous vous contacterons pour coordonner la livraison ou
              la cueillette à la ferme. Les délais varient selon la période et le volume de commandes.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-xl mb-3" style={{ color: "#1A1A1A" }}>5. Politique de remboursement</h2>
            <p className="leading-relaxed">
              En raison de la nature périssable des fleurs, les remboursements ne sont pas offerts une fois
              la commande confirmée et le paiement traité, sauf en cas d&apos;erreur de notre part. Si vous
              recevez un produit endommagé ou non conforme, contactez-nous dans les 24 heures suivant la
              réception à{" "}
              <a href={`mailto:${email}`} style={{ color: "#2D5016" }}>{email}</a>.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-xl mb-3" style={{ color: "#1A1A1A" }}>6. Abonnements</h2>
            <p className="leading-relaxed">
              Les abonnements aux bouquets sont des engagements sur la durée convenue. L&apos;annulation
              anticipée doit être communiquée par courriel avec un préavis de 7 jours. Aucun remboursement
              partiel n&apos;est accordé pour la période en cours.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-xl mb-3" style={{ color: "#1A1A1A" }}>7. Auto-cueillette</h2>
            <p className="leading-relaxed">
              Les billets d&apos;auto-cueillette sont non remboursables mais transférables. En cas de conditions
              météorologiques extrêmes rendant l&apos;activité impossible, Florus Pocus offrira un report de
              la date ou un crédit.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-xl mb-3" style={{ color: "#1A1A1A" }}>8. Limitation de responsabilité</h2>
            <p className="leading-relaxed">
              Florus Pocus ne peut être tenue responsable des dommages indirects résultant de l&apos;utilisation
              de ses produits. Notre responsabilité est limitée au montant de la commande concernée.
            </p>
          </section>

          <section>
            <h2 className="font-heading font-bold text-xl mb-3" style={{ color: "#1A1A1A" }}>9. Droit applicable</h2>
            <p className="leading-relaxed">
              Ces conditions sont régies par les lois de la province de Québec et du Canada.
            </p>
            <p className="text-sm mt-4" style={{ color: "#999" }}>Dernière mise à jour : juin 2026</p>
          </section>

        </div>
      </div>
    </main>
  );
}
