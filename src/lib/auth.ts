import { createClient } from "./supabase-server";
import { redirect } from "next/navigation";
import type { AppUser } from "@/types";

export async function getSession() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getUser(): Promise<AppUser | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  return data as AppUser | null;
}

export async function requireAdmin() {
  const user = await getUser();
  if (!user || !user.is_admin) {
    redirect("/admin/login");
  }
  return user;
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
