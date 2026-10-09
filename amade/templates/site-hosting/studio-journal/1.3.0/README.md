# Studio Journal 1.3.0

A brand-neutral Astro starter for a small studio, independent practice, or service business. It combines a practical introduction page with a working editorial section, based on patterns explored in the StaticWeb Astro projects.

## Pages and content

- `/` — studio introduction, services, recent writing, and contact call to action.
- `/blog/` — published article index.
- `/blog/{slug}/` — article detail pages generated from Markdown.
- `src/content/posts/<slug>/index.md` — one Markdown file per post bundle; related files live in `images/` beside it. Required frontmatter is `title`, `description`, and `pubDate`; `is_public` defaults to `false` and must be `true` to appear in public output.

## Personalize

The `navigation` customization default supplies the starter menu as labels and internal `href` paths. `publishing.routes.listing` identifies the initial post-list path and matches a default menu item. BlogGenius owns menu edits, publishing-menu selection, path validation, and placeholder pages for custom internal paths. Replace the sample service descriptions and posts with your own information. Add a production domain to `astro.config.mjs` when setting up canonical URLs for search engines.

## Build

```sh
npm install
npm run build
npm run preview
```

The static output is written to `dist/`. This resource is licensed under MIT; see `LICENSE`.
