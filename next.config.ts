import type { NextConfig } from "next";

const SECURITY_HEADERS = [
  // Prevent MIME sniffing on the served PNGs / JSON.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Don't leak full URLs (with player IDs / search queries) to third
  // parties when users click external links.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disallow framing entirely. Users embedding cards elsewhere can use
  // the /api/card/[id] PNG instead of an iframe.
  { key: "X-Frame-Options", value: "DENY" },
  // Limit which browser features pages can use. Keep this tight; expand
  // if a feature is genuinely needed.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;
