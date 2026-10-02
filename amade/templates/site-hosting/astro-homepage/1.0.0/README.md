# Astro Homepage 1.0.0

Amade Site Hosting template for a small static homepage and BlogGenius-managed posts. It is a normal Astro project after materialization.

## BlogGenius contract

- Customizable JSON values are declared in `resource.json` and written into `astro/src/site-config.json` when the Site is created.
- Markdown posts live in `astro/src/content/posts/` and use `title`, `description`, and `pubDate` frontmatter.
- `/blog/` lists posts and `/blog/{slug}/` renders an individual post.
- The build command is `npm run build`; generated files are written to `astro/dist/`.

The template package is licensed under MIT.
