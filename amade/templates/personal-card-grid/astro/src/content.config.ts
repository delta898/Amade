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
  z.object({ kind:z.literal('post'), title:z.string().min(1), description:z.string().min(1), date:z.preprocess(value=>{if(value instanceof Date)return Number.isNaN(value.valueOf())?undefined:value.toISOString().slice(0,10);if(typeof value!=='string'||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value))return undefined;const date=new Date(`${value}T00:00:00.000Z`);return !Number.isNaN(date.valueOf())&&date.toISOString().slice(0,10)===value?value:undefined;},z.string().optional()).transform(value=>value?new Date(`${value}T00:00:00.000Z`):undefined), editorial_status:z.enum(['draft','complete']).default('draft'), publication:z.enum(['none','private','public']).default('none') }).strict(),
  z.object({ kind:z.literal('work'), title:z.string().min(1), description:z.string().min(1), order:z.number().int().nonnegative().optional(), is_public:z.boolean().default(false) }).strict(),
 ]),
});
export const collections = { content };
