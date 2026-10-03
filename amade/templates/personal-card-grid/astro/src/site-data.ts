import { z } from 'astro/zod';
import rawSite from '../../../site-data/site.json';

const pathSchema = z.string().regex(/^\/(?!\/)(?!.*(?:^|\/)\.{1,2}(?:\/|$))(?!.*[?#\\\\]).*$/);
const schema = z.object({
  displayName: z.string().min(1),
  headline: z.string().min(1),
  biography: z.string().min(1),
  logo: z.string().regex(/^\/(?!\/)(?!.*\.\.).+$/).optional(),
  navigation: z.array(z.object({
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    label: z.string().min(1),
    path: pathSchema,
  }).strict()).min(1).superRefine((items, ctx) => {
    const ids = items.map(item => item.id);
    if (new Set(ids).size !== ids.length) ctx.addIssue({ code: 'custom', message: 'navigation ids must be unique' });
  }),
}).strict();

const result = schema.safeParse(rawSite);
if (!result.success) throw new Error(`Invalid personal-homepage site.json: ${result.error.message}`);
export default result.data;
