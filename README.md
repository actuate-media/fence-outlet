# Fence Outlet

Next.js App Router site integrated with Prenta CMS. The homepage resolves the
published `/` document and renders its Prenta page sections. Without CMS
configuration, it renders a local placeholder so the project can still build.

## Development

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Set `PRENTA_CMS_URL` to the Prenta CMS origin in `.env.local`. Set
`PRENTA_CMS_API_KEY` only when the CMS instance requires it.

## Production

```sh
npm run build
npm start
```