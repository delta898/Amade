import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
export default defineConfig({ output: 'static', publicDir: fileURLToPath(new URL('../../site-data/public/', import.meta.url)) });
