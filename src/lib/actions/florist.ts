"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase-server";

export type FloristState = { error?: string };

const COOKIE = "fp_florist";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 jours

export async function verifyFloristCode(_prev: FloristState, formData: FormData): Promise<FloristState> {
  const code = (formData.get("code") as string ?? "").trim();
  if (!code) return { error: "Veuillez entrer le code d'accès." };

  const supabase = await createAdminClient();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "florist_access_code")
    .single();

  const expected = data?.value ?? "fleuriste2026";

  if (code !== expected) {
    return { error: "Code d'accès invalide." };
  }

  const jar = await cookies();
  jar.set(COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  redirect("/fleuristes");
}

export async function isFloristAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  return jar.get(COOKIE)?.value === "1";
}
