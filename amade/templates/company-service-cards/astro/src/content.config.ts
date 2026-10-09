import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const dateOnly = z.preprocess((value) => {
  if (value instanceof Date) return Number.isNaN(value.valueOf()) ? undefined : value.toISOString().slice(0, 10);
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value ? value : undefined;
}, z.string().optional()).transform((value) => value ? new Date(`${value}T00:00:00.000Z`) : undefined);

const publishedAt = z.preprocess((value) => {
  const candidate = value instanceof Date
    ? (Number.isNaN(value.valueOf()) ? undefined : value.toISOString())
    : value;
  return typeof candidate === 'string'
    && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(candidate)
    && !Number.isNaN(Date.parse(candidate)) ? candidate : undefined;
}, z.string().optional());

const content = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: new URL('../../../site-data/data/', import.meta.url).pathname,
    generateId({ entry, data }) {
      const path = entry.replace(/\\/g, '/');
      const match = path.match(/^(pages)\/([a-z0-9]+(?:-[a-z0-9]+)*)\.md$/)
        || path.match(/^(posts|work|services)\/([a-z0-9]+(?:-[a-z0-9]+)*)\/index\.md$/);
      const expectedKind = match?.[1] === 'pages' ? 'page'
        : match?.[1] === 'posts' ? 'post'
        : match?.[1] === 'services' ? 'service'
        : match?.[1] === 'work' ? 'work'
        : undefined;
      if (!match || !expectedKind || !["page", "post", "service"].includes(expectedKind)
          || (data.kind !== undefined && data.kind !== expectedKind)) {
        throw new Error(`Unsupported company-homepage content path or kind: ${entry}`);
      }
      return `${expectedKind}/${match[2]}`;
    },
  }),
  schema: ({ image }) => z.object({
    kind: z.enum(["page", "post", "service"]).optional(),
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    author: z.string().min(1).optional(),
    cover: image().optional(),
    cover_alt: z.string().optional(),
    path: z.string().regex(/^\/(?!\/)(?!.*(?:^|\/)\.{1,2}(?:\/|$))(?!.*[?#\\\\]).*$/).optional(),
    date: dateOnly,
    published_at: publishedAt,
    editorial_status: z.enum(['draft', 'complete']).default('draft'),
    publication: z.enum(['none', 'private', 'public']).default('none'),
    is_public: z.boolean().default(false),
    order: z.number().int().nonnegative().optional(),
  }).passthrough(),
});

export const collections = { content };
