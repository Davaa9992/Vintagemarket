import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker-т жижиг image хийхэд (Dockerfile)
  output: "standalone",
  experimental: {
    // Шинэ барааны зураг server action-аар дамжина (8 зураг хүртэл)
    serverActions: { bodySizeLimit: "40mb" },
  },
};

export default nextConfig;
