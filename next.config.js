/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Camera + service worker need these headers on the scan page (served over HTTPS in production)
  async headers() {
    return [
      {
        // Security headers on every page (pre-launch audit fix).
        source: "/(.*)",
        headers: [
          // Blocks clickjacking: the app cannot be embedded in other sites.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Stops browsers from "guessing" file types (MIME sniffing).
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Only send the page origin (not the full URL) as the referrer.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        source: "/scan",
        headers: [
          { key: "Permissions-Policy", value: "camera=self" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
