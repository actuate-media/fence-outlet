---
name: prenta-add-section
description: "Turn a designed section into an editable Prenta CMS page-builder section — schema + renderer + optional block + seed, kept in sync. Invoke when the user wants a designed section (hero, pricing, stats, features, CTA, testimonials, gallery, FAQ, logos, etc.) editable in the admin Page editor, or asks to 'add a section', 'make this design editable in the CMS', or 'build this page in the CMS'."
---

# Add an Prenta custom section

Turn a designed section into an **editable** Prenta page-builder section so
editors author it in the admin Page editor (Add Section → field inspector) and
it renders identically on the public site. Follow this contract exactly — it
keeps the pieces in sync so a section never renders in one place but breaks in
another.

## The visual stack (page-level rule)

A page is a **visual stack**: an ordered list of small, single-purpose sections
(`data.sections`), one section per visual band of the design (hero, logos,
stats, features, pricing, testimonials, FAQ, CTA, …), added top to bottom. When
asked to build a whole page from a design:

1. Slice the design into horizontal bands and map each band to an existing
   section type first (`marketingSectionTypes`, or `list_section_types` over
   MCP).
2. Follow this skill once per band that has no matching type — each new type
   stays single-purpose.
3. **Never** create one section type that holds the entire page, and never
   stretch one type's fields across several bands. If a type's fields describe
   more than one band, split it.

The page's canvas outline should read as the design's band list — one row per
band. If it doesn't, the build is wrong even when the rendered page looks right.

## The model — two files (+ optional block + seed)

1. **Schema** — an entry in `marketingSectionTypes` in `src/sections/types.ts`.
   Declares the type + its editable fields. **Pure data, no React** (this file is
   imported by `prenta.config.ts`, which the admin client bundle loads).
2. **Renderer** — an entry in the `sectionRenderers` map in
   `src/sections/register.tsx`. One React function per type, used for **both**
   the public site and the admin editor canvas. Reads `section.content`.
3. *(optional)* **Block** — a typed presentational component in `src/blocks/`
   the renderer adapts to (keeps the renderer thin).
4. *(recommended)* **Seed** — an entry in `prenta.seed.json` so the section
   ships with real content (`npm run populate`).

The schema `id` and the renderer map key **must match** —
`npm run verify:sections` enforces it.

## Procedure (per section)

### 1. Choose the editable fields
From the design, list what an editor should change (headings, body, CTA
label+url, images, repeating rows like plans/stats/cards). Everything purely
decorative or structural stays in the component's markup — do NOT make it a field.

### 2. Add the schema — `src/sections/types.ts`
Append to the `marketingSectionTypes` array:

```ts
{
  id: 'pricing',              // kebab-case, unique, === renderer map key
  name: 'Pricing Table',      // shown in the Add Section gallery
  scope: ['page'],            // 'page' | 'post'
  icon: 'badge-dollar-sign',  // any lucide-react icon name
  description: 'A grid of pricing plans.',
  category: 'conversion',     // layout | content | media | conversion
  fields: [
    { key: 'heading', label: 'Heading', type: 'text', required: true },
    {
      key: 'plans', label: 'Plans', type: 'repeater', rowLabel: 'Plan',
      fields: [
        { key: 'name', label: 'Plan name', type: 'text', required: true },
        { key: 'price', label: 'Price', type: 'text', required: true },
        { key: 'description', label: 'Description', type: 'textarea' },
      ],
    },
  ],
  defaultContent: { heading: 'Pricing', plans: [] },
}
```

### 3. Add the renderer — `src/sections/register.tsx`
Add a key to the `sectionRenderers` map. Read data from `section.content`
(guard every value — content is untyped JSON):

```tsx
pricing: ({ section }) => {
  const c = section.content ?? {};
  const heading = typeof c.heading === 'string' ? c.heading : '';
  const plans = Array.isArray(c.plans) ? c.plans : [];
  return <PricingGrid heading={heading} plans={plans} />;
},
```

Renderers must be **client-safe** (the admin canvas runs them in the browser)
**and SSR-safe** (the public site renders them on the server): plain
presentational components only — no `useEffect` data fetching, no server-only
imports. A renderer that throws falls back to a structural placeholder.

### 4. (optional) Extract a block to `src/blocks/` and import it in the renderer.

### 5. Seed — `prenta.seed.json`
Add a section to the target page's `sections` array with realistic content:

```json
{ "id": "sec-pricing", "sectionType": "pricing", "name": "Pricing Table",
  "visible": true,
  "content": { "heading": "Simple pricing", "plans": [ { "name": "Pro", "price": "$79/mo" } ] },
  "settings": { "paddingY": "xl" } }
```

### 6. Verify
```bash
npm run verify:sections   # schema ids <-> renderer keys match
npm run dev               # open the admin Page editor; add + edit the section
```

## Field types (`type:` values)

| type | use for |
|------|---------|
| `text` | short single-line copy |
| `textarea` | multi-line plain copy |
| `richText` | formatted prose |
| `url` | a link (pair with a `text` label field for buttons) |
| `media` | image / file picker |
| `select` | fixed options — provide `options: [{ label, value }]` |
| `boolean` | on/off toggle |
| `color` | a color value |
| `relationship` | reference other documents — `relationTo: 'slug'` |
| `repeater` | repeatable rows — provide `fields: [...]`, `rowLabel`, optional `minRows`/`maxRows` |
| `stats` | preset repeater of { value, label, description } rows |
| `gallery` | preset repeater of { url, alt, caption } image rows |

Each repeater row is stored as an object keyed by its sub-field `key`s.

## Design → schema mapping

- Editable copy → `text` / `textarea` / `richText`.
- A button → two fields: a `text` label + a `url`.
- An image → `media`.
- A repeating group (plans, stats, features, logos, testimonials, FAQ) →
  `repeater` (or the `stats` / `gallery` presets).
- A fixed choice (alignment, variant) → `select`.
- Decorative / structural markup → NOT a field; keep it in the component.

## Checklist before you finish

- [ ] Schema `id` === renderer map key (`npm run verify:sections` passes).
- [ ] Renderer reads `section.content` and guards every value.
- [ ] Renderer is client- and SSR-safe (no browser- or server-only APIs).
- [ ] No React / components in `src/sections/types.ts`.
- [ ] Seed entry (if added) uses the same `sectionType` id + realistic content.
- [ ] The section appears in Add Section and edits live in `npm run dev`.
