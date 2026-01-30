import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.centris.ca',
      },
      {
        protocol: 'https',
        hostname: 'images.duproprio.com',
      },
    ],
  },
}

export default nextConfig
