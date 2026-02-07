import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export', // Outputs a static build to the /out folder
  images: {
    unoptimized: true, // Required for static export on Pi
  },
  trailingSlash: true,
};

export default nextConfig;
