/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // @lhd/shared ships raw ESM TypeScript with no build step, so Next must
  // transpile it as part of the web app build.
  transpilePackages: ['@lhd/shared'],
};

export default nextConfig;
