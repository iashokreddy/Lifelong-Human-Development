// Static export mode is used for GitHub Pages (STATIC_EXPORT=true). Pages is a
// static host, so the site is pre-rendered at build time from packages/content
// (see lib/content-source.ts). The default mode is unchanged: a server-rendered
// app that talks to the NestJS API.
const isStaticExport = process.env.STATIC_EXPORT === 'true';

// GitHub project pages are served from /<repo-name>/, so assets and links need
// a base path. Set NEXT_PUBLIC_BASE_PATH (e.g. "/Lifelond-Human-Development").
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // @lhd/shared ships raw ESM TypeScript with no build step, so Next must
  // transpile it as part of the web app build.
  transpilePackages: ['@lhd/shared'],
  ...(isStaticExport
    ? {
        output: 'export',
        trailingSlash: true,
        images: { unoptimized: true },
        ...(basePath ? { basePath, assetPrefix: basePath } : {}),
      }
    : {}),
};

export default nextConfig;
