/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Since Supabase bucket URLs are dynamic, allow all or specify
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      }
    ],
  },
};

export default nextConfig;
