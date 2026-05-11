import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/daily-notebook",
  images: { unoptimized: true },
};

export default nextConfig;