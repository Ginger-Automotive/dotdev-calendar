import { build } from 'esbuild';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

const RAW_URL =
  'https://raw.githubusercontent.com/Ginger-Automotive/dotdev-calendar/main/dist/dotdev-calendar.user.js';

const banner = `// ==UserScript==
// @name         DotDev 2026 Calendar View
// @namespace    https://github.com/Ginger-Automotive/dotdev-calendar
// @version      ${pkg.version}
// @description  Adds a toggleable clash-aware calendar/timeline view to the DotDev 2026 sessions and my-list pages
// @author       dotdev-calendar
// @match        https://dotdev.shopify.com/pages/sessions*
// @match        https://dotdev.shopify.com/pages/my-list*
// @run-at       document-idle
// @noframes
// @grant        none
// @downloadURL  ${RAW_URL}
// @updateURL    ${RAW_URL}
// ==/UserScript==`;

await build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  format: 'iife',
  target: ['es2020'],
  outfile: 'dist/dotdev-calendar.user.js',
  banner: { js: banner },
  legalComments: 'none',
});

console.log('Built dist/dotdev-calendar.user.js');
