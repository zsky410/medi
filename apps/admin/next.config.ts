import path from "node:path";
import { config as loadDotenv } from "dotenv";
import type { NextConfig } from "next";

loadDotenv({ path: path.join(__dirname, "../../.env") });

const apiOrigin = process.env.API_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  transpilePackages: ["@medi/types"],
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
