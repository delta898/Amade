import { z } from 'astro/zod';
import rawSite from '../../../site-data/site.json';

const pathSchema = z.string().regex(/^\/(?!\/)(?!.*(?:^|\/)\.{1,2}(?:\/|$))(?!.*[?#\\\\]).*$/);
const schema = z.object({
  displayName: z.string().min(1),
  logo: pathSchema.optional(),
  seoDescription: z.string().max(300).optional(),
  shareImage: pathSchema.optional(),
  favicon: pathSchema.optional(),
  searchEngineIndexing: z.boolean().default(true),
  navigation: z.array(z.object({
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    label: z.string().min(1),
    path: pathSchema,
  }).strict()).min(1),
}).strict();

const result = schema.safeParse(rawSite);
if (!result.success) throw new Error(`Invalid digital-garden site.json: ${result.error.message}`);
export default result.data;
