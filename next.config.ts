import type { NextConfig } from 'next';
import { withPrentaCMS } from '@prenta/core/next';
import config from './prenta.config';

const nextConfig: NextConfig = {
  images: {
    // Serve AVIF first (≈50% smaller than JPEG), then WebP, for the best LCP.
    // next/image negotiates the format per request based on Accept headers.
    formats: ['image/avif', 'image/webp'],
    // Storage backend for CMS media. Add your own CDN/host here as needed.
    remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }],
  },
};

export default withPrentaCMS(config, nextConfig);
