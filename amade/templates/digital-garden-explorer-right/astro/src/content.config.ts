import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const knowledge = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: new URL('../../../site-data/data/knowledge/notes/', import.meta.url).pathname,
    generateId: ({ entry }) => entry.replace(/\\/g, '/').replace(/\.md$/i, ''),
  }),
  schema: z.object({ title: z.string().min(1).optional(), source_path: z.string().optional() }).passthrough(),
});

export const collections = { knowledge };
