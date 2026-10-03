import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const posts = defineCollection({
  loader: glob({ pattern: "**/index.md", base: "./src/content/posts" }),
  schema: z.object({ title: z.string(), description: z.string(), pubDate: z.coerce.date(), is_public: z.boolean().default(false) })
});

export const collections = { posts };
