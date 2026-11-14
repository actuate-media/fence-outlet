# Custom fonts

Place licensed `.woff2` files here, then:

1. Uncomment the `@font-face` rules in `app/(site)/globals.css`.
2. Uncomment the `<link rel="preload">` hints in `app/(site)/layout.tsx`.
3. Keep `font-display: swap` and preload only the weights you use above the fold.

Recommended filenames:

- `display.woff2` — headings (600–700)
- `body.woff2` — body copy (400–500)

Self-hosted fonts avoid third-party latency and keep LCP predictable.
