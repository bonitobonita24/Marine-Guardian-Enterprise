import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: [
    "@marine-guardian/ui",
    "@marine-guardian/shared",
    "@marine-guardian/db",
    "@marine-guardian/jobs",
    "@marine-guardian/storage",
  ],
  // Next.js 15: serverComponentsExternalPackages moved to top-level serverExternalPackages
  serverExternalPackages: ["@prisma/client", "prisma"],
};

export default nextConfig;
