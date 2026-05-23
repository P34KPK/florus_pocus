import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase-server";
import Sidebar from "@/components/admin/Sidebar";

export const metadata = { title: { template: "%s | Admin — Florus Pocus", default: "Admin" } };

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return (
      <div className="flex min-h-screen" style={{ backgroundColor: "#F5F5F5" }}>
        <Sidebar userEmail="dev@floruspocus.ca" />
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const adminSupabase = createAdminClient();
  const { data: profile } = await adminSupabase
    .from("users")
    .select("is_admin, email")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) redirect("/admin/login");

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#F5F5F5" }}>
      <Sidebar userEmail={profile.email} />
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
