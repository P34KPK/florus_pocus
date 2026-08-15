"use client";

import dynamic from "next/dynamic";
import type { PricingConfig } from "@/lib/pricing";

const CartDrawer = dynamic(() => import("@/components/CartDrawer"), { ssr: false });

export default function ClientCartDrawer({ pricing }: { pricing: PricingConfig }) {
  return <CartDrawer pricing={pricing} />;
}
