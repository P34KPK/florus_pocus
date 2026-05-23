import type { Metadata } from "next";

export const metadata: Metadata = { title: "Paramètres" };

export default function AdminParametresPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-2xl">Paramètres</h1>
        <p className="text-sm opacity-50 mt-1">Configuration générale du site</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[
          { title: "Informations du site", desc: "Nom, description, logo" },
          { title: "Paiement Square",      desc: "Clés API et configuration" },
          { title: "Supabase",             desc: "Base de données et stockage" },
          { title: "Notifications email",  desc: "SMTP et templates" },
        ].map((s) => (
          <div key={s.title} className="bg-white rounded-2xl border border-[#E0D5C8] shadow-sm p-6">
            <h3 className="font-heading font-semibold mb-1">{s.title}</h3>
            <p className="text-sm opacity-50 mb-4">{s.desc}</p>
            <div className="h-24 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#F5F5F5" }}>
              <p className="text-xs opacity-30">Disponible Phase 3</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
