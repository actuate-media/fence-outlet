import { defineConfig } from '@prenta/core/config';
import { blogPostCollection } from '@prenta/core';
import { seoPlugin } from '@prenta/plugin-seo';
import { formsPlugin } from '@prenta/plugin-forms';
import { redirectsPlugin } from '@prenta/plugin-redirects';
import { mediaPlugin } from '@prenta/plugin-media';
import { emailPlugin } from '@prenta/plugin-email';
import { marketingSectionTypes } from './src/sections/types';

export default defineConfig({
  // This file is imported by the admin (client) bundle, so it must stay free of
  // platform adapters — they pull in `node:*` and break the client build. These
  // are client-safe shorthands; Prenta auto-wires the matching platform adapter
  // (storage, etc.) server-side when the API handler boots. To register a custom
  // adapter, call `setStorageAdapter()` in your API route — never here.
  platform: {
    database: { provider: 'prisma' },
    storage: { provider: 'vercel-blob' },
  },

  auth: {
    providers: [],
    credentials: { enabled: true },
  },

  collections: {
    pages: {
      slug: 'pages',
      labels: { singular: 'Page', plural: 'Pages' },
      type: 'page',
      urlPrefix: '',
      seo: { sitemapPriority: 0.8, sitemapChangeFreq: 'monthly' },
      fields: {
        title: { type: 'text', label: 'Title', required: true },
        slug: { type: 'slug', label: 'URL Slug', from: 'title' },
        // Full route this page renders at (e.g. '/', '/about', '/services/seo').
        // Distinct from `slug`: `path` lets a page model nested/custom routes;
        // the renderer falls back to `/${slug}` when it's blank.
        path: { type: 'text', label: 'Path' },
        // Ordered list of page-editor sections (flat PageSection[] JSON). The
        // section-based Page Editor reads/writes this; the public site renders
        // it with <Sections>. Declared as `json` so the field-access layer
        // doesn't strip it on write.
        sections: { type: 'json', label: 'Sections' },
        featuredImage: { type: 'media', label: 'Featured Image', accept: ['image/*'] },
        // Organizational tags (slugs from the page-tags collection) + tree
        // parent. Must be declared so Pages list bulk-tag / nest writes persist.
        tags: { type: 'json', label: 'Tags' },
        primaryTag: { type: 'text', label: 'Primary Tag' },
        parentPageId: { type: 'text', label: 'Parent Page' },
        metaTitle: { type: 'text', label: 'Meta Title' },
        metaDescription: { type: 'text', label: 'Meta Description' },
        ogImage: { type: 'media', label: 'OG Image', accept: ['image/*'] },
      },
    },
    // Hidden collection backing the Pages tag system. Tag documents store
    // name (title) + slug + color; pages reference them by slug in data.tags.
    'page-tags': {
      slug: 'page-tags',
      labels: { singular: 'Page Tag', plural: 'Page Tags' },
      fields: {
        title: { type: 'text', label: 'Name', required: true },
        slug: { type: 'slug', label: 'Slug', from: 'title' },
        color: { type: 'text', label: 'Color' },
        description: { type: 'text', label: 'Description' },
        sortOrder: { type: 'number', label: 'Sort Order' },
        active: { type: 'boolean', label: 'Active' },
      },
      admin: { hidden: true },
    },
    // Canonical blog-post schema (sections, body, excerpt, category,
    // publishDate, SEO fields, related posts) — guaranteed compatible with
    // the admin Post Editor. Override or extend via the factory's options:
    // blogPostCollection({ extraFields: { … }, urlPrefix: 'news' }).
    posts: blogPostCollection(),
  },

  globals: {
    'site-settings': {
      slug: 'site-settings',
      label: 'Site Settings',
      access: { read: () => true },
      fields: {
        siteName: { type: 'text', label: 'Site Name' },
        description: { type: 'text', label: 'Description' },
        phone: { type: 'text', label: 'Phone' },
        email: { type: 'email', label: 'Email' },
      },
    },
  },

  // Custom section types for the Page/Post editor. Schema lives in
  // src/sections/types.ts; the matching public renderers are registered in
  // src/sections/register.tsx (imported by app/(site)/layout.tsx). See SECTIONS.md.
  sections: {
    types: marketingSectionTypes,
  },
  // Site-wide SEO defaults. Admins can override most fields in Admin → Settings
  // without redeploying. `siteUrl` must match NEXT_PUBLIC_SITE_URL in production
  // (no trailing slash). See DEPLOYMENT.md and the Prenta docs "Prototype → Production"
  // guide for the full launch checklist.
  seo: {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
    trailingSlash: 'never',
    siteName: 'fence-outlet',
    defaultMetaDescription: 'Welcome to fence-outlet.',
    // Upload a 1200×630 image in Media and set defaultSocialImageAssetId in Admin → SEO,
    // or place a file at public/og-default.png and use an absolute URL in production.
    defaultOgImage: '/og-default.png',
    organization: {
      name: 'fence-outlet',
    },
    robots: {
      noIndexNonProduction: true,
    },
  },

  plugins: [
    seoPlugin(),
    formsPlugin(),
    redirectsPlugin(),
    mediaPlugin({
      maxFileSize: 10 * 1024 * 1024,
      allowedTypes: ['image/*', 'application/pdf', 'video/mp4'],
    }),
    emailPlugin({
      provider: 'resend',
      from: 'noreply@example.com',
    }),
  ],

  admin: {
    path: '/admin',
    // Split login: auth screens (login, setup wizard, password reset) live on
    // their own mount; signed-out visits to `path` get a 404 lookalike, and
    // emailed reset/invite links point here.
    loginPath: '/securelogin',
    branding: {
      name: 'fence-outlet',
    },
  },
});
