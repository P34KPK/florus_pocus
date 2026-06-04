/** URL canonique du site, sans slash final. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.floruspocus.com"
).replace(/\/+$/, "");
