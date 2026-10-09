# Astro Homepage 1.2.0

Amade Site Hosting template for a small static homepage and BlogGenius-managed posts. It is a normal Astro project after materialization.

## BlogGenius contract

- Customizable JSON values are declared in `resource.json` and written into `astro/src/site-config.json` when the Site is created.
- Posts use one folder per post: `astro/src/content/posts/<slug>/index.md`; related images go in that folder’s `images/` directory and use entry-relative Markdown links. Required frontmatter is `title`, `description`, and `pubDate`; `is_public` defaults to `false` and must be `true` to appear in the public listing or receive a static detail page.
- `/blog/` lists posts and `/blog/{slug}/` renders an individual post.
- BlogGenius can add up to 12 internal placeholder pages; each menu name becomes a one-segment route and the page is ready for editing in Astro.
- The build command is `npm run build`; generated files are written to `astro/dist/`.

The template package is licensed under MIT.
