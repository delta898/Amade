# Astro Homepage 1.3.0

Amade Site Hosting template for a small static homepage and BlogGenius-managed posts. It is a normal Astro project after materialization.

## BlogGenius contract

- The `navigation` customization default supplies the starter menu. Each item has a `label` and internal `href`.
- `publishing.routes.listing` is the starter post-list path and matches one default menu `href`. BlogGenius owns menu editing, internal-path validation, publishing-menu selection, and placeholder page creation for custom paths.
- Posts use one folder per post: `astro/src/content/posts/<slug>/index.md`; related images go in that folder’s `images/` directory and use entry-relative Markdown links. Required frontmatter is `title`, `description`, and `pubDate`; `is_public` defaults to `false` and must be `true` to appear in the public listing or receive a static detail page.
- `/blog/` lists posts and `/blog/{slug}/` renders an individual post.
- The build command is `npm run build`; generated files are written to `astro/dist/`.

The template package is licensed under MIT.
