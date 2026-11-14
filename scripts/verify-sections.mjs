#!/usr/bin/env node
/**
 * verify:sections — fast static check that every custom section type declared
 * in src/sections/types.ts has a registered public renderer in
 * src/sections/register.tsx (and vice versa), so a page can never reference a
 * section type with no renderer ("no dead sections").
 *
 * Intentionally dependency-free and build-free: it scans the two source files
 * as text rather than executing TypeScript, so it runs the moment the project
 * is scaffolded.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function read(rel) {
  try {
    return readFileSync(join(root, rel), 'utf-8');
  } catch {
    return '';
  }
}

const typesSrc = read('src/sections/types.ts');
const registerSrc = read('src/sections/register.tsx');

// Top-level section types declare `id: '...'`; sub-fields use `key:`, so this
// only matches section-type ids.
const declared = new Set([...typesSrc.matchAll(/\bid:\s*['"]([\w-]+)['"]/g)].map((m) => m[1]));
// register.tsx declares each renderer as a map entry (`id: ({ section }) => …`),
// so match an indented identifier key immediately followed by a function.
const registered = new Set(
  [...registerSrc.matchAll(/^\s+['"]?([\w-]+)['"]?\s*:\s*(?:async\s+)?\(/gm)].map((m) => m[1]),
);

let ok = true;
if (declared.size === 0) {
  console.error('verify:sections — no custom section types found in src/sections/types.ts');
  ok = false;
}
for (const id of declared) {
  if (!registered.has(id)) {
    console.error(`verify:sections — "${id}" is declared in types.ts but has no renderer in register.tsx`);
    ok = false;
  }
}
for (const id of registered) {
  if (!declared.has(id)) {
    console.error(`verify:sections — "${id}" has a renderer in register.tsx but is not declared in types.ts`);
    ok = false;
  }
}

if (!ok) process.exit(1);
console.log(`verify:sections — OK (${declared.size} section type(s) declared and registered)`);
