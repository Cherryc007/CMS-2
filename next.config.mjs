/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // ✅ Add this to fix cookies on Vercel domains
  trustHost: true, 
  
  experimental: {
    serverActions: true,
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
        pathname: '/api/portraits/**',
      }
    ],
  },
};

export default nextConfig;
