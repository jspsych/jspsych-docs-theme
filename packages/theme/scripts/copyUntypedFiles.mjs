/**
 * tsc only emits .js/.d.ts. Theme components also ship CSS modules (and any
 * other non-TS assets) that webpack in the consumer site resolves relative to
 * the compiled output, so mirror every non-TS file from src/ into lib/.
 * Same approach as the official @docusaurus/theme-* build scripts.
 */
import {cpSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const pkgDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

cpSync(path.join(pkgDir, 'src'), path.join(pkgDir, 'lib'), {
  recursive: true,
  // Directories never match the extension test, so they are always traversed.
  filter: (src) => !/\.(ts|tsx)$/.test(src),
});
