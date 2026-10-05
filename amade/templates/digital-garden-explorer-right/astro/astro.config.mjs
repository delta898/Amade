import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  site: process.env.BLOGGENIUS_SITE_URL || undefined,
  output: 'static',
  trailingSlash: 'always',
  publicDir: fileURLToPath(new URL('../../../site-data/public/', import.meta.url)),
});
