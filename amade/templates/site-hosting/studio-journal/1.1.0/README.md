# Studio Journal 1.1.0

A brand-neutral Astro starter for a small studio, independent practice, or service business. It combines a practical introduction page with a working editorial section, based on patterns explored in the StaticWeb Astro projects.

## Pages and content

- `/` — studio introduction, services, recent writing, and contact call to action.
- `/blog/` — published article index.
- `/blog/{slug}/` — article detail pages generated from Markdown or MDX.
- `src/content/posts/` — BlogGenius-ready content collection.
- BlogGenius can add up to 12 internal placeholder pages; each menu name becomes a one-segment route and the page is ready for editing in Astro.

## Personalize

BlogGenius reads the supported `site_name`, `logo`, and `navigation` defaults from `resource.json` and writes them to `astro/src/site-config.json` when the Site is created. Replace the sample service descriptions and posts with your own information. Add a production domain to `astro.config.mjs` when setting up canonical URLs for search engines.

## Build

```sh
npm install
npm run build
npm run preview
```

The static output is written to `dist/`. This resource is licensed under MIT; see `LICENSE`.
