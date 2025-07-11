import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
        pathname: '/**', // Allow all image paths from this domain
      },
      { // Add this new pattern for Cloudinary
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**', // Allow all image paths from this domain
      },
    ],
  },
};

export default nextConfig;