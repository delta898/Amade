import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
const content = defineCollection({
 loader: glob({
  pattern: '**/*.md',
  base: new URL('../../../site-data/data/', import.meta.url).pathname,
  generateId({ entry, data }) {
   const path = entry.replace(/\\/g, '/');
   const match = path.match(/^(pages)\/([a-z0-9]+(?:-[a-z0-9]+)*)\.md$/)
    || path.match(/^(posts|services)\/([a-z0-9]+(?:-[a-z0-9]+)*)\/index\.md$/);
   const expectedKind = match?.[1] === 'pages' ? 'page' : match?.[1] === 'posts' ? 'post' : match?.[1] === 'services' ? 'service' : undefined;
   if (!match || data.kind !== expectedKind) throw new Error(`Unsupported company-homepage content path or kind: ${entry}`);
   return `${expectedKind}/${match[2]}`;
  },
 }),
 schema: z.discriminatedUnion('kind', [
  z.object({ kind:z.literal('page'), title:z.string().min(1), path:z.string().regex(/^\/(?!\/)(?!.*(?:^|\/)\.{1,2}(?:\/|$))(?!.*[?#\\\\]).*$/), is_public:z.boolean().default(false) }).strict(),
  z.object({ kind:z.literal('post'), title:z.string().min(1), description:z.string().min(1), pubDate:z.coerce.date(), is_public:z.boolean().default(false) }).strict(),
  z.object({ kind:z.literal('service'), title:z.string().min(1), description:z.string().min(1), order:z.number().int().nonnegative().optional(), is_public:z.boolean().default(false) }).strict(),
 ]),
});
export const collections = { content };
