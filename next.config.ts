import path from 'node:path';
import { fileURLToPath } from 'node:url';
import webpack from 'webpack';
import type { NextConfig } from 'next';
import { withPrentaCMS } from '@prenta/core/next';
import config from './prenta.config';

const configDir = path.dirname(fileURLToPath(import.meta.url));
const clientAppearanceEntry = path.join(configDir, 'src/prenta-appearance-client.ts');
const nodeBuiltinStub = path.join(configDir, 'src/webpack-client-stubs/node-builtin.ts');

const CLIENT_NODE_BUILTINS = [
  'async_hooks',
  'child_process',
  'crypto',
  'diagnostics_channel',
  'dns',
  'fs',
  'http',
  'https',
  'inspector',
  'module',
  'net',
  'os',
  'perf_hooks',
  'tls',
  'worker_threads',
  'zlib',
] as const;

const nextConfig: NextConfig = {
  // `next build` defaults to Turbopack. A webpack hook without this key
  // makes that build exit before compiling.
  turbopack: {},
  // Client compiler only. Server and edge keep the real Node modules.
  webpack: (webpackConfig, { isServer }) => {
    if (!isServer) {
      webpackConfig.resolve ??= {};
      const current = webpackConfig.resolve.alias;
      const alias = current && !Array.isArray(current) ? current : {};
      // The appearance barrel also exports server-only favicon rasterizing.
      alias['@prenta/core/appearance$'] = clientAppearanceEntry;
      webpackConfig.resolve.alias = alias;
      const fallback = { ...(webpackConfig.resolve.fallback ?? {}) };
      for (const builtin of CLIENT_NODE_BUILTINS) {
        fallback[builtin] = nodeBuiltinStub;
      }
      webpackConfig.resolve.fallback = fallback;
      // The admin client evaluates server barrels. Named Node imports such as
      // `randomUUID` are not used while rendering the login screen.
      webpackConfig.module ??= {};
      webpackConfig.module.parser ??= {};
      webpackConfig.module.parser.javascript ??= {};
      webpackConfig.module.parser.javascript.exportsPresence = false;
      // `node:` requests fail as an unhandled scheme before fallback resolution.
      webpackConfig.plugins ??= [];
      webpackConfig.plugins.push(
        new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
          resource.request = nodeBuiltinStub;
        }),
      );
    }
    return webpackConfig;
  },
  images: {
    // Serve AVIF first (≈50% smaller than JPEG), then WebP, for the best LCP.
    // next/image negotiates the format per request based on Accept headers.
    formats: ['image/avif', 'image/webp'],
    // Storage backend for CMS media. Add your own CDN/host here as needed.
    remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }],
  },
};

export default withPrentaCMS(config, nextConfig);
