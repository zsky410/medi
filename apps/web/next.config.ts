import path from "node:path";
import { config as loadDotenv } from "dotenv";
import type { NextConfig } from "next";

// Monorepo: shared secrets live in repo root `.env` (same as apps/api).
loadDotenv({ path: path.join(__dirname, "../../.env") });

const apiOrigin = process.env.API_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  transpilePackages: ["@medi/types"],
  // Ensure NEXT_PUBLIC_* from root `.env` reach client bundles.
  env: {
    NEXT_PUBLIC_GOONG_MAP_KEY: process.env.NEXT_PUBLIC_GOONG_MAP_KEY ?? "",
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${apiOrigin}/:path*`,
      },
    ];
  },
};

export default nextConfig;
