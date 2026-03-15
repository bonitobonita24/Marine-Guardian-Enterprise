import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@marine-guardian/ui",
    "@marine-guardian/shared",
    "@marine-guardian/db",
    "@marine-guardian/jobs",
    "@marine-guardian/storage",
  ],
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "prisma"],
  },
};

export default nextConfig;
