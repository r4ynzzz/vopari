import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
  env: {
    CRON_SECRET: process.env.CRON_SECRET,
  },
};

export default nextConfig;
