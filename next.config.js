/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    APP_PROJECT_ID: process.env.APP_PROJECT_ID,
    MONGODB_URI: process.env.MONGODB_URI,
    MONGODB_DATABASE: process.env.MONGODB_DATABASE,
    POKT_RPC_KEY: process.env.POKT_RPC_KEY,
  },
  webpack: config => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
}

module.exports = nextConfig
