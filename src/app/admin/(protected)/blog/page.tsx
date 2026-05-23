import type { Metadata } from "next";
import { createClient } from "@/lib/supabase-server";
import type { BlogPost } from "@/types";
import BlogClient from "@/components/admin/blog/BlogClient";

export const metadata: Metadata = { title: "Blog" };

export default async function AdminBlogPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });

  const posts: BlogPost[] = data ?? [];

  return (
    <div className="p-8">
      <BlogClient posts={posts} />
    </div>
  );
}
