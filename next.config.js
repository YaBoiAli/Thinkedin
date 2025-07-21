/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['firebase'],
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      undici: false, // ⛔️ Block undici completely
    };
    config.module.rules.push({
      test: /\.m?js$/,
      resolve: {
        fullySpecified: false,
      },
    });
    return config;
  },
};

module.exports = nextConfig;
