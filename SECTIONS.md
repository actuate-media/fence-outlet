# Custom Sections

This project uses the **marketing-custom** template, which wires up custom
section types end to end. A custom section has just two files:

1. **Schema** (`src/sections/types.ts`) — declares the type so the admin Page
   editor can author it (Add Section gallery + field-driven inspector). Wired
   into `prenta.config.ts` as `sections: { types: marketingSectionTypes }`.
2. **Renderer** (`src/sections/register.tsx`) — ONE map (`sectionRenderers`)
   that renders each type, used for **both** the public site and the admin
   editor canvas. `app/(site)/layout.tsx` imports the module (registering the
   public renderers via `<Sections>`), and the admin page passes the same
   `sectionRenderers` to `<AdminRoot sectionRenderers={...}>` so editors see the
   real component while they edit — no separate admin-renderer file to keep in
   sync. Read section data from `section.content`.

Renderers must be client-safe (the admin canvas runs them in the browser) and
SSR-safe (the public site renders them on the server) — presentational
components under `src/blocks/` satisfy both. A renderer that throws falls back
to a structural placeholder in the canvas automatically.

## The visual stack

A page is an ordered stack of small, single-purpose sections — one section per
visual band of the design (hero, stats, pricing, CTA, …), added top to bottom
in the Page editor canvas. Reuse an existing type for each band before adding a
new one, and never build a "fat" type that holds an entire page: if a type's
fields describe more than one visual band, split it. The canvas outline should
read as the design's band list.

## Adding sections from a design (agent)

This project ships an agent skill at
`.cursor/skills/prenta-add-section/SKILL.md`. Ask your agent (Cursor, Claude,
etc.) to make a designed section editable and it follows that contract — emitting
the schema + renderer (+ optional block + seed) in sync — so a design becomes an
editable CMS section without hand-wiring. The manual steps below are the same
thing, done by hand.

## Add a section type

1. Add an entry to `marketingSectionTypes` in `src/sections/types.ts`.
2. (Optional) build a presentational component under `src/blocks/`.
3. Add a renderer for the new `id` to the `sectionRenderers` map in
   `src/sections/register.tsx` — it drives both the public site and the admin
   canvas.
4. Run `npm run verify:sections` to confirm the schema and renderers match.
5. (Astro-split) Add a fixture in `packages/sections/src/__tests__/section-parity.test.tsx`
   and run `npm run test:parity`.

## Starter homepage seed

`prenta.seed.json` contains a pre-filled "Marketing homepage" (hero, stats,
pricing, CTA) plus a **Contact** page with an embedded form. Load it after your first deploy / local setup:

```bash
npm run populate
```

Then open the admin Page editor — every section is real, editable content.

## Repeater fields

Use `type: 'repeater'` with a `fields` sub-schema for structured arrays (the
included Pricing section uses one for its plans). Each row is an object keyed by
the sub-field `key`s.

## Component blocks

`src/blocks/` holds typed presentational components. Generate a manifest of
their props for tooling/migrations:

```bash
npm run blocks:extract   # writes prenta-blocks.json
npm run blocks:diff      # compares the committed manifest to the current source
```

Commit `prenta-blocks.json` so `blocks:diff` can flag breaking prop changes in
review.
