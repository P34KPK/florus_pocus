import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

function createRatelimiter(requests: number, window: `${number} ${"s" | "m" | "h" | "d"}`) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  return new Ratelimit({
    redis:     Redis.fromEnv(),
    limiter:   Ratelimit.slidingWindow(requests, window),
    analytics: false,
  });
}

// 5 tentatives / 15 minutes par IP — login admin
export const loginRatelimit = createRatelimiter(5, "15 m");

// 20 uploads / 1 heure par IP
export const uploadRatelimit = createRatelimiter(20, "1 h");
