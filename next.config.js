/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow loading agency logos from any external domain
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

module.exports = nextConfig;
