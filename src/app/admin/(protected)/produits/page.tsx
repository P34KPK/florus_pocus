import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase-server";
import type { Product } from "@/types";
import ProductsClient from "@/components/admin/produits/ProductsClient";

export const metadata: Metadata = { title: "Produits" };

export default async function AdminProduitsPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("products")
    .select("*, images:product_images(image_url, sort_order)")
    .order("created_at", { ascending: false })
    .order("sort_order", { referencedTable: "product_images", ascending: true });

  const products: Product[] = data ?? [];

  return (
    <div className="p-8">
      <ProductsClient products={products} />
    </div>
  );
}
