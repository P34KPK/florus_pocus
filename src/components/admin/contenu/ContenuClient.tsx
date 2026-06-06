"use client";

import { useActionState, useEffect } from "react";
import { updateSiteSettings, type SettingsState } from "@/lib/actions/settings";
import { CheckCircle2, Info } from "lucide-react";

interface Row { key: string; value: string; label: string; grp: string }

interface Props {
  grouped: Record<string, Row[]>;
  groupLabels: Record<string, string>;
}

const URL_KEYS = ["social_instagram", "social_linkedin"];
const LONG_KEYS = ["whylocal_reason1_desc", "whylocal_reason2_desc", "whylocal_reason3_desc", "whylocal_reason4_desc", "abonnements_subtitle"];

export default function ContenuClient({ grouped, groupLabels }: Props) {
  const [state, formAction, pending] = useActionState<SettingsState, FormData>(updateSiteSettings, {});

  useEffect(() => {
    if (state.success) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [state.success]);

  const field  = "block w-full border border-[#E0D5C8] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#2D5016] transition-colors bg-white";
  const labelC = "block text-xs font-semibold text-[#1A1A1A] opacity-60 mb-1 uppercase tracking-wide";

  return (
    <form action={formAction} className="space-y-10">
      {state.success && (
        <div className="flex items-center gap-2 text-sm font-medium px-4 py-3 rounded-xl" style={{ backgroundColor: "#F0F5EC", color: "#2D5016" }}>
          <CheckCircle2 size={16} /> Modifications enregistrées et publiées sur le site.
        </div>
      )}
      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{state.error}</p>
      )}

      {Object.entries(grouped).map(([grp, rows]) => (
        <section key={grp} className="rounded-2xl border border-[#E0D5C8] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E0D5C8]" style={{ backgroundColor: "#F9F7F4" }}>
            <h2 className="font-heading font-semibold text-base" style={{ color: "#2D5016" }}>
              {groupLabels[grp] ?? grp}
            </h2>
          </div>

          <div className="px-6 py-5 space-y-4 bg-white">
            {grp === "footer" && (
              <div className="flex items-start gap-2 px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: "#F0F5EC", color: "#2D5016" }}>
                <Info size={15} className="flex-shrink-0 mt-0.5" />
                <span>
                  L&apos;adresse, le téléphone et le courriel affichés dans le pied de page
                  sont gérés dans la section <strong>« Coordonnées »</strong> plus haut.
                </span>
              </div>
            )}
            {rows.map((row) => (
              <div key={row.key}>
                <label className={labelC}>{row.label}</label>
                {LONG_KEYS.includes(row.key) ? (
                  <textarea
                    name={row.key}
                    defaultValue={row.value}
                    rows={3}
                    className={`${field} resize-none`}
                  />
                ) : (
                  <input
                    name={row.key}
                    type={URL_KEYS.includes(row.key) ? "url" : "text"}
                    defaultValue={row.value}
                    className={field}
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      ))}

      <button
        type="submit"
        disabled={pending}
        className="w-full font-heading font-semibold py-3 rounded-xl text-sm text-white transition-all hover:opacity-90 disabled:opacity-50"
        style={{ backgroundColor: "#2D5016" }}
      >
        {pending ? "Enregistrement…" : "Sauvegarder toutes les modifications"}
      </button>
    </form>
  );
}
