import type { NextConfig } from "next";

const authBaseUrl = process.env.NEXT_PUBLIC_AUTH_API_URL;
const userBaseUrl = process.env.NEXT_PUBLIC_USER_API_URL;
const jobBaseUrl = process.env.NEXT_PUBLIC_JOB_API_URL ;
const utilsBaseUrl = process.env.NEXT_PUBLIC_UTILS_API_URL ;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: `${authBaseUrl}/api/auth/:path*`,
      },
      {
        source: "/api/user/:path*",
        destination: `${userBaseUrl}/api/user/:path*`,
      },
      {
        source: "/api/job/:path*",
        destination: `${jobBaseUrl}/api/job/:path*`,
      },
      {
        source: "/api/utils/:path*",
        destination: `${utilsBaseUrl}/api/utils/:path*`,
      },
    ];
  },
};

export default nextConfig;
