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
    || path.match(/^(posts|work)\/([a-z0-9]+(?:-[a-z0-9]+)*)\/index\.md$/);
   const expectedKind = match?.[1] === 'pages' ? 'page' : match?.[1] === 'posts' ? 'post' : match?.[1];
   if (!match || data.kind !== expectedKind) throw new Error(`Unsupported personal-homepage content path or kind: ${entry}`);
   return `${expectedKind}/${match[2]}`;
  },
 }),
 schema: z.discriminatedUnion('kind', [
  z.object({ kind:z.literal('page'), title:z.string().min(1), path:z.string().regex(/^\/(?!\/)(?!.*(?:^|\/)\.{1,2}(?:\/|$))(?!.*[?#\\\\]).*$/), is_public:z.boolean().default(false) }).strict(),
  z.object({ kind:z.literal('post'), title:z.string().min(1), description:z.string().min(1), date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value=>{const date=new Date(`${value}T00:00:00.000Z`);return !Number.isNaN(date.valueOf())&&date.toISOString().slice(0,10)===value;},'Expected a valid YYYY-MM-DD date').transform(value=>new Date(`${value}T00:00:00.000Z`)).optional(), editorial_status:z.enum(['draft','complete']).default('draft'), publication:z.enum(['none','private','public']).default('none') }).strict(),
  z.object({ kind:z.literal('work'), title:z.string().min(1), description:z.string().min(1), order:z.number().int().nonnegative().optional(), is_public:z.boolean().default(false) }).strict(),
 ]),
});
export const collections = { content };
