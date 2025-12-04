import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export for S3 + CloudFront deployment
  output: 'export',

  // Trailing slashes help with S3 routing
  trailingSlash: true,

  // Disable image optimization for static export (use unoptimized images)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
