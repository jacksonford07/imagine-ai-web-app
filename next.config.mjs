/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    // US-024 moved bot-ops pages under /fulfillment; keep old links working.
    return [
      { source: "/overview", destination: "/fulfillment", permanent: false },
      {
        source: "/chats",
        destination: "/fulfillment/chats",
        permanent: false,
      },
      {
        source: "/chats/:path*",
        destination: "/fulfillment/chats/:path*",
        permanent: false,
      },
      {
        source: "/escalations",
        destination: "/fulfillment/escalations",
        permanent: false,
      },
      {
        source: "/health",
        destination: "/fulfillment/health",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
