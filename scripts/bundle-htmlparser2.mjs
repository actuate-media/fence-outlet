import fs from 'node:fs';
import path from 'node:path';
import * as esbuild from 'esbuild';

// sanitize-html is CommonJS and require()s htmlparser2. htmlparser2 12 is
// ESM-only, and the Vercel Node runtime rejects that require. Ship a CJS
// bundle and point the package's require export at it.
const root = path.resolve('node_modules/htmlparser2');
const outfile = path.join(root, 'dist/index.cjs');

await esbuild.build({
  entryPoints: [path.join(root, 'dist/index.js')],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outfile,
  logLevel: 'silent',
});

const pkgPath = path.join(root, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const current = pkg.exports?.['.'];
const importEntry =
  typeof current === 'string' ? current : current?.import ?? current?.default ?? './dist/index.js';
pkg.exports ??= {};
pkg.exports['.'] = {
  types: './dist/index.d.ts',
  require: './dist/index.cjs',
  import: importEntry,
  default: importEntry,
};
fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 4)}\n`);
