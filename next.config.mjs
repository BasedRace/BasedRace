/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'jqbebvtxpxfdpetelwkj.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/racer-images/**',
      },
    ],
  },
};

export default nextConfig;
