import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase-server";
import MessagesClient from "@/components/admin/messages/MessagesClient";

export const metadata: Metadata = { title: "Messages" };

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  created_at: string;
}

export default async function AdminMessagesPage() {
  const supabase = await createAdminClient();
  const { data } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8">
      <MessagesClient messages={(data ?? []) as ContactMessage[]} />
    </div>
  );
}
