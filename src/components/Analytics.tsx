"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export default function Analytics() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;

    const payload = JSON.stringify({
      path:     pathname,
      referrer: document.referrer || undefined,
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([payload], { type: "application/json" }));
    } else {
      fetch("/api/track", { method: "POST", body: payload, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {});
    }
  }, [pathname]);

  return null;
}
