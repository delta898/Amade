# Amade package formats

> This document and the `*-v1.schema.json` files describe the original Amade package format. They remain the reference for existing 1.x resources and the current legacy catalog integration, but they are **not** the contract for new Site Hosting templates.
>
> **Current experimental format:** Site Hosting Templates and BlogGenius UI Styles share the grouped catalog at `amade/catalog/index.json`, whose index shape is `0.1.0`, but use separate package schemas. The unified Site Hosting Contract is currently `0.2.0-dev1` and remains experimental until the packages and BlogGenius consumers have been validated together. The v1 material below is retained as a historical reference for legacy packages.

## Current experimental package layout

```text
amade/
  catalog/index.json                   # groups families/templates and UI styles
  families/<family-id>/family.json     # catalog grouping only
  content-models/<model-id>/content-model.json # reusable data and publishing rules
  templates/<template-id>/template.json
  styles/<style-id>/style.json         # BlogGenius appearance tokens
  spec/
    common-metadata-v0.1.schema.json
    catalog-index-v0.1.schema.json
    site-hosting-family-v0.2.schema.json
    site-hosting-content-model-v0.2.schema.json
    site-hosting-template-v0.2.schema.json  # current Site Hosting schemas
    site-hosting-family-v0.1.schema.json     # preserved legacy schema
    bloggenius-ui-style-v0.1.schema.json
```

Each **Template** package and **UI Style** package shares user-facing metadata: name, description, author, package version, license, creation date, categories, tags, preview, optional screenshots, homepage, support, lifecycle status, and required BlogGenius compatibility. Families are grouping metadata, not selectable packages, so their manifests do not use this common package metadata.

The catalog exposes `families[]` with their `templates[]`, and `styles[]` as a separate resource type. Site Hosting Templates contain a complete Astro project, their own initial site-data seed, and an exact Content Model reference. UI Styles contain only token data for the versioned BlogGenius semantic token contract; they do not distribute executable JavaScript or arbitrary CSS. Consumers list only packages whose status is `active`. `deprecated` and `withdrawn` remain in the catalog for history and existing references but are not offered for new selection.

Site Hosting uses one shared **Site Hosting Contract Version**, currently `0.2.0-dev1`. Family, Content Model, and Template manifest `spec_version` plus Template `compatibility.contract.version` must all have this same value. Any contract change advances these four fields together. A template package's own `version` remains independent and identifies that package release; `compatibility.min_bloggenius_version` remains the minimum app release. The Amade catalog-index format (`spec_version: 0.1.0`) and BlogGenius UI Style contract (`1.1`) are outside this Site Hosting contract.

The current version source is [`site-hosting-contract-version.json`](site-hosting-contract-version.json). After an explicitly approved version change, run `node amade/scripts/sync-site-hosting-contract-version.js` from the Amade repository root to update Family, Content Model, and Template declarations and all three current JSON Schemas. Run the same command with `--check` to verify synchronization without writing files.

**Version approval rule:** Maintainers and coding agents must not select a future version number on their own. When a contract change requires a bump, explain the reason and ask the user to choose the exact shared version before changing any version field. Apply that approved value to Family, Content Model, and Template `spec_version` plus Template `compatibility.contract.version` together and verify consistency. The template package's independent release `version` and Content Model's `model_version` are not implied by this decision and require separate choices when they need to change.

Current Site Hosting Templates require BlogGenius `0.6.0` and declare either `bloggenius-site-hosting-template` or `bloggenius-knowledge-collection-template` with contract version `0.2.0-dev1`. UI Styles use `bloggenius-ui-style-tokens` contract `1.1`. Consumers reject inconsistent contracts and preserve their fallback.

### BlogGenius UI Style tokens 1.1

The active 0.1 UI Style package schema is `bloggenius-ui-style-v0.1.schema.json`, and its complete token map is defined by `bloggenius-ui-style-tokens-v1.1.schema.json`. Contract 1.1 adds the required `--ui-form-control-disabled-opacity` token. BlogGenius uses it for disabled form fields; disabled buttons continue to use `--ui-button-disabled-opacity`. The bundled compatibility/theme files provide local fallback values, while selected Amade packages provide the active style values. Keep all active packages and the BlogGenius consumer in sync with the token contract. `remote-test-style` is an isolated test fixture and is not part of the active 1.1 style set.

Contract `0.1.0-dev1` introduced manifest-declared `setup_inputs` and a local directory input for a Knowledge Collection root. Contract `0.1.0-dev2` adds a `frontmatter_match` input with purpose `publication_filter`; BlogGenius renders property and match-value fields and stores them with the selected root in the local Site manifest. Contract `0.1.0-dev3` made the optional shared site SEO profile available to Digital Garden families, matching Homepage behavior. Contract `0.1.0-dev4` defined template updates: replace the materialized Astro project while preserving Site `site-data/` and BlogGenius-owned site metadata. Thus site name, menu, uploaded media, Vault configuration, and content survive; edits inside the replaceable Astro project do not. Applying an update does not deploy the site.

Implementation and verification status are tracked in the [BlogGenius development record](../../../NaverAutoBlog/docs/plans/active/2026-10-01-static-site-builder-main-development.md). This contract remains experimental until package validation and BlogGenius consumer checks are complete.

## Current Site Hosting content contract (0.2.0-dev1)

The canonical data and publishing rules live in each Template's referenced `content-model.json`; Family manifests only group templates. See [the 0.2 role and boundary design](site-hosting-content-model-v0.2-design.md). Markdown file paths establish content kind and stable ID; frontmatter supplies optional metadata and behavior. The current models define the supported content kinds and fields for their templates. An explicitly supplied `kind` must match the path. Invalid optional `date` or `published_at` values are omitted rather than blocking a build. Invalid visibility enums remain errors because they control deployed output.

| Field | Requirement | Meaning / behavior |
|---|---|---|
| `kind` | Optional; inferred from path | If supplied, must match `pages/`, `posts/`, `work/`, or `services/`. |
| `title` | Optional | Display title; fallback is first Markdown H1, then path-derived slug. |
| `description` | Optional | Summary for listings and SEO; absent summaries are omitted. |
| `author` | Optional string | Creator name; emitted as author metadata only when supplied. BlogGenius does not invent a value. |
| `cover` | Optional local image path relative to the post file | Representative image; BlogGenius records the first image block here. Astro uses it for post-list thumbnails and `og:image`. A manually authored post may set it explicitly. |
| `cover_alt` | Optional string | Alternative text for `cover`; BlogGenius copies the image block title. |
| `date` | Optional `YYYY-MM-DD` | Writing/content date. Invalid values are ignored. |
| `published_at` | Optional ISO 8601 date-time with explicit timezone | BlogGenius writes this at immediate publication; invalid values are ignored. Used for article metadata and newest-first ordering. |
| `editorial_status` | Optional; defaults to `draft`; `draft` or `complete` | Writing completeness only. |
| `publication` | Optional; defaults to `none`; `none`, `private`, or `public` | Deployment/listing intent. `none` emits no page; `private` deploys an unlisted page; `public` deploys and lists it. |
| `path` | Optional for pages | If absent, page route derives from the path ID. |
| `is_public` | Optional for pages/work/services; defaults to `false` | Controls whether non-post content is built as public output. |
| `order` | Optional for work/services | Non-negative ordering hint. |
| `tags`, `categories`, other fields | Optional and user-owned | Preserved as frontmatter data and ignored by templates unless a future contract explicitly consumes them. |

No frontmatter field is universally required. IDs are stable from the validated source path: `pages/<id>.md`, `posts/<slug>/index.md`, and the family's work/service equivalent. IDs do not require a frontmatter field. `publication` missing or `none` keeps posts local-only from the deployment perspective. Temporary save is `draft + none`; immediate publish is `complete + public` plus `published_at`.

The `publication` values are independent from editorial completeness. `private` is unlisted, not access-controlled: a visitor who knows the URL can access the statically deployed page. Tags/categories remain user-owned. Family, Content Model, and Template `spec_version` plus Template `compatibility.contract.version` are `0.2.0-dev1`. Template package release versions remain independent.

Public posts sort newest-first by `published_at`, then `date`, then stable path-derived content ID. Each detail title uses `<post title> | <site name>`. The `cover` frontmatter value is the single representative-image source: BlogGenius writes the first image block to `cover` and its title to `cover_alt`; Astro uses the processed cover for list thumbnails and `og:image` when the site origin is known. Templates render but never rewrite Markdown frontmatter.

### Site profile and page metadata (0.2.0-dev1)

The shared `site_profile.fields` contract supports these optional properties alongside the family's required profile data:

| Property | Rule | Behavior |
|---|---|---|
| `seoDescription` | Optional string, at most 300 characters | Supplies description metadata for the homepage and template-provided listing pages. It is not a fallback for post or authored page descriptions. |
| `shareImage` | Optional public URL path under `site-data/public/` | Supplies `og:image` for the homepage and template-provided listing pages only. Individual posts use only their own `cover`; no site-image fallback is applied. |
| `favicon` | Optional public URL path under `site-data/public/` | Supplies the browser tab icon independently from the logo and share image. |
| `searchEngineIndexing` | Optional boolean; defaults to `true` | `false` emits `noindex, nofollow` metadata on every generated page. This controls indexing signals, not access; deployed URLs remain public. |

`displayName` remains the source for the site brand, `og:site_name`, and page-title suffix. Page titles use `<page title> | <site name>`. A post's own description and `cover` are used only when supplied; a missing post description or cover remains omitted. These fields are stored with site data. Content Model declarations define them; Family membership does not guarantee that every Template in that Family supports the same data. Existing Sites retain their copied template snapshot and need an explicit template upgrade or recreation to receive new template rendering behavior.

## Legacy v1 reference

The sections below document the original package format and schemas. They do not define the 0.1 package or catalog contract.

This document preserves the v1 package layout, schema meanings, and authoring workflow. The JSON Schemas below are authoritative only for v1 manifests. Update this guide alongside a v1 schema or supported-behavior change. For current Site Hosting work, use the 0.2 Family, Content Model, and Template schemas and the linked role design; the v0.1 Family draft is retained as history.

## 1. Resource model

The v1 format defines two kinds of resources for BlogGenius:

- `site-hosting`: a complete, buildable Astro project used to create a new Site.
- `bloggenius-style`: a data-only appearance pack for `BlogGenius > Settings > App > Appearance`.

Both kinds share a catalog and common resource envelope. Their kind-specific configuration is kept separate. This lets BlogGenius discover both from Amade while each feature validates and consumes only its own data.

```text
Amade catalog index
  ├─ common resource metadata: id, kind, name, description, author, version, license, links, preview, screenshots
  ├─ site_hosting: Astro source, customization targets, publishing contract
  └─ bloggenius_style: BlogGenius token-contract ID and token values
```

`site-hosting` is currently implemented in BlogGenius. The `bloggenius-style` schema is defined, but Amade Style retrieval and applying a selected Style in BlogGenius are follow-up work. A field being declared in the schema does not imply that every BlogGenius screen already edits or consumes it.

## 2. Repository layout

```text
amade/
  catalog/index.json
  spec/
    README.md
    catalog-index-v1.schema.json
    resource.schema.json
    site-hosting-v1.schema.json
    bloggenius-style-v1.schema.json
  templates/
    site-hosting/<id>/<version>/
      resource.json
      preview.svg
      astro/                 # the complete Astro project
    bloggenius-style/<id>/<version>/
      resource.json
      preview.png            # preview media required by the common envelope
      style.json             # token data package
```

The historical v1 development catalog pointed to 1.3.0 of [`astro-homepage`](../templates/site-hosting/astro-homepage/1.3.0/README.md) and [`studio-journal`](../templates/site-hosting/studio-journal/1.3.0/README.md). The current dev catalog uses 0.1 Template Families instead; these legacy packages remain as reference material.

A Site Hosting resource contains the Astro project itself. It is not merely a screenshot or a link to another repository: BlogGenius copies the declared Astro source into a new Site so it can be edited, built, previewed, and deployed as an ordinary Astro project. Existing Astro projects can be used as a starting point for a package; remove personal data and secrets, decide which files are reusable, and declare only supported customization points.

## 3. Catalog index

`amade/catalog/index.json` is the v1 entry point BlogGenius reads from a branch selected by runtime environment: `dev` for local/development and, when published, `main` for production. As of 2026-10-04, the local `dev` branch contains the v1 catalog while `main` contains only `README.md`. V1 has no per-template lifecycle field: presence in the catalog array determines whether a package is offered for new creation. Removing an entry hides it from new discovery but does not erase its immutable Git revision or copied source in existing Sites.

Each catalog resource entry contains:

- `kind`: `site-hosting` or `bloggenius-style`.
- `id`: stable lowercase kebab-case identity for the resource.
- `version`: resource package version.
- `revision`: full 40-character Git commit SHA containing the manifest and package files.
- `manifest`: path to `resource.json` within that commit.

BlogGenius reads the environment's catalog branch, then fetches the referenced manifest and files from the immutable `revision`. Therefore catalog updates can add a template without an app release, while a package fetch remains pinned to the exact commit chosen by the catalog.

For the initial BlogGenius consumer, keep one active catalog entry per `kind` and `id`. To release a replacement, bump the package version and update that entry's version and revision. Do not overwrite a published package version. Older revisions remain in Git history, and already-created Sites have their own copied source plus the selected source revision in their metadata.

## 4. Common resource manifest

Every v1 resource has an `amade/templates/<kind>/<id>/<version>/resource.json` manifest validated by `resource.schema.json` and the appropriate kind schema. V1 has no `active`/`deprecated`/`withdrawn` field; do not infer those states from the 0.1 manifest rules.

| Field | Meaning |
| --- | --- |
| `schema_version` | Version of the common manifest shape; currently `1`. |
| `id`, `kind` | Stable identity and resource type. |
| `name`, `description` | User-facing template identity and summary. |
| `author` | Public creator name or handle. New resources should include it; `maintainer` is retained as a legacy field. |
| `version` | Immutable release version for the resource package. A published version is never overwritten. |
| `license` | License identifier or clear license label for this package. Every resource chooses its own license. |
| `homepage` | Optional HTTPS link to the creator or resource website. |
| `support` | Optional support contact, currently an email address or HTTPS link. |
| `created_at` | Optional ISO date when the resource was first created; keep it stable across later versions. |
| `preview` | One representative image for template cards; includes file path, SHA-256, and optional media type. It is separate from the source package file list. |
| `screenshots` | Optional array of additional images for a future detail view. Each entry has a path, SHA-256, and optional media type; these files are separate from the source package file list. |
| `compatibility` | Compatibility declarations such as Astro and BlogGenius versions. |
| `package.path` | Base directory for the package files. v1 templates use `.`. |
| `package.files[]` | Each package file's relative path, SHA-256, and optional byte size. |
| `site_hosting` | Required only for `kind: site-hosting`; points to `site-hosting-v1.schema.json`. |
| `bloggenius_style` | Required only for `kind: bloggenius-style`; points to `bloggenius-style-v1.schema.json`. |

The `preview.path` is relative to the directory containing `resource.json`; each `package.files[].path` is relative to `package.path`. In the current package layout, both happen to resolve under the version directory because `package.path` is `.`.

The current list UI is BlogGenius's Site creation template picker. It shows the resource name, author, description, and preview; when `homepage` is present, it shows an icon link. Amade currently provides the catalog and packages rather than a separate browse website, but a future Amade page can reuse the same metadata.

Paths must be relative and must not escape their declared base directory. SHA-256 is computed from the exact file bytes. `size`, when included, is the file length in bytes. Keep the manifest, preview, screenshots, license, and all project files in the pinned revision. Recompute hashes for `preview` and every `screenshots[]` image after edits; these media entries are not repeated in `package.files[]`.

## 5. Site Hosting contract

`site-hosting-v1.schema.json` defines the metadata BlogGenius needs to create and eventually publish content to an Astro Site.

### Astro project

`site_hosting.astro` declares:

- `source`: Astro project directory relative to the package base. v1 currently requires the directory name `astro`.
- `build_command`: the package's documented build command; the initial BlogGenius runtime currently uses its own Astro build behavior and does not yet honor arbitrary per-template commands.
- `output_directory`: the expected static build output. The initial runtime currently expects Astro's normal `dist/` output.

Include a real Astro project: `package.json` and lockfile, `astro.config.mjs`, source files, and any needed `public/` assets, components, styles, and content. Do not include generated `node_modules/`, `.astro/`, `dist/`, `.git/`, credentials, personal environment files, or private analytics keys. Use a sample post rather than copying a user's private content. A project that depends on undocumented local files or a private service is not a portable template.

### Declared customization

Each `customization.fields[]` entry declares a value BlogGenius may apply to a JSON configuration file:

- `key`: stable customization identity. v1 currently supports `site_name`, `logo`, and `navigation`.
- `type`: current input kind (`string`, `image`, or `navigation`).
- `label`, `default`, and `required`: user-facing input metadata and initial value.
- `target.file`: JSON file under the Astro source, such as `src/site-config.json`.
- `target.path`: dotted JSON key path to update, such as `name` or `navigation`.

Keep customizable values in a small, explicit config file instead of asking BlogGenius to rewrite arbitrary Astro/JavaScript source. In v1, `target` is limited to JSON paths, and unsupported `key` or `type` values must not be invented without a schema and consumer update. The Site creation flow can apply the declared name, logo, and starter navigation. Navigation defaults are the `label` and internal `href` values in the `navigation` customization field. `publishing.routes.listing` identifies the default menu destination for the post list and must match one default `href`. When users edit menus or choose another menu for the post list, BlogGenius validates and applies those values during site creation/build. For a custom internal path, BlogGenius creates a placeholder page using the template’s declared `site_hosting.pages` behavior.

### Navigation and publishing menu

The manifest uses the existing `customization.fields` navigation default as the starter menu. Each item contains a visible `label` and an internal `href` (for example `/about/`). Keep this data as the template’s initial menu; user edits belong to the generated Site configuration.

`publishing.routes.listing` is the initial post-list path and must match one navigation default `href`. During Site creation, BlogGenius lets the user select which menu item opens the post list; the selected item’s internal path becomes that Site’s listing route. BlogGenius owns path validation and generates a placeholder page for custom internal menu paths, while the template provides the default pages and its declared placeholder-page route.

The manifest does not declare editable fields, item-count rules, path policies, or UI behavior. Keeping those rules out of the template avoids duplicating behavior that belongs to BlogGenius.

### Future BlogGenius publishing contract

`site_hosting.pages`, when present, declares the template-supported internal placeholder page behavior. In v1, `mode: static_placeholders` means the Astro package has a dynamic static route that reads the page list from its declared JSON target and emits one page per entry. BlogGenius derives a safe one-segment slug from the user's menu name, respects the reserved slugs and item limit, and stores `{ label, slug }` in the declared target. The template must render a useful placeholder with a path back to the home page. External URLs and user-authored paths are not accepted.

`site_hosting.publishing` schema version 2 declares the content contract that both 1.2.0 templates implement:

- `format: markdown`: post bodies are Markdown. YAML frontmatter is a separate Amade/BlogGenius convention; it is not part of the CommonMark syntax itself.
- `content_directory`: relative to the Astro source, currently `src/content/posts`.
- `post_layout`: each post is a directory named by its URL slug, containing `index.md` and an `images/` folder. Markdown image paths are relative to `index.md`, for example `![Alt](./images/photo.jpg)`.
- `frontmatter`: required `title` (string), `description` (string), and `pubDate` (date); optional `is_public` (boolean) defaults to `false`.
- `visibility`: only `is_public: true` posts are included in the listing and static detail routes. Missing visibility is treated as private.
- `routes.listing` and `routes.detail`: the public collection route (`/blog/`) and item route (`/blog/{slug}/`).

A minimal post bundle looks like this:

```text
src/content/posts/<slug>/
  index.md
  images/
    photo.jpg
```

The legacy unversioned `publishing` shape remains accepted for already-published 1.1.0 resources. The two 1.2.0 working packages use schema version 2. The verification record below is a focused Astro build proof, not a claim that BlogGenius publishing has shipped.

### Focused publishing-contract verification

On 2026-10-03, temporary copies of both Astro Homepage and Studio Journal 1.2.0 were built with Astro 7.3.5. Each build included a fixture with `is_public: true`, one with `is_public: false`, and one with `is_public` omitted; every fixture referenced an entry-relative `./images/proof.svg`. Results for both templates:

- The public post appeared in `/blog/` and generated `/blog/<slug>/` HTML.
- The private post generated neither a listing item nor a detail route.
- The post missing `is_public` was also excluded because the collection schema defaults it to `false`. Studio Journal's homepage recent-post section also excluded private fixtures.
- The relative SVG reference was rewritten to a hashed `/_astro/` asset, and that generated file existed in `dist`.
- Both builds completed successfully from temporary copies; the Amade package source was not modified by the build output.

This validates the selected bundle layout, visibility, and route behavior in both Astro templates. BlogGenius does not yet create or publish these post bundles; that remains a tracked follow-up.

## 6. BlogGenius Style contract

`bloggenius-style-v1.schema.json` describes a data-only pack for BlogGenius's existing appearance styles. It requires:

- `schema_version: 1` and `token_contract: bloggenius-style-tokens-1.0`.
- A stable `style_id`.
- Every required semantic CSS token value from the BlogGenius token contract; unknown token names are rejected by this schema.
- No arbitrary executable JavaScript or CSS package behavior in v1.

The required token list must remain synchronized with BlogGenius `DESIGN_STYLE_REQUIRED_TOKENS`. If that application contract changes, update the Amade Style schema and this guide together, then implement and verify the matching BlogGenius consumer before publishing a Style resource.

## 7. Adding or updating a resource

### Development and production catalogs

- Historically, `dev` was the v1 development catalog. It now contains the 0.1 grouped Site Hosting catalog consumed by BlogGenius local/development builds.
- `main` is the intended production catalog branch. As of 2026-10-04 it contains only `README.md` and has no production catalog; do not interpret this historical v1 workflow as a current production publication.
- Package versions remain immutable in both branches. The catalog entry pins the package's commit SHA, so promotion updates the catalog reference without changing the package contents.
- BlogGenius can override the catalog URL for controlled checks with `BLOGGENIUS_SITE_TEMPLATE_CATALOG_URL`; normal runtime selection is local/development → `dev`, production → `main`.

### New resource

1. Work on `dev`. Choose the kind, stable ID, version, license, and compatibility range.
2. For `site-hosting`, prepare a complete buildable Astro project, one representative preview image, and optional additional screenshots. For `bloggenius-style`, supply the required token data and preview if available.
3. Write the kind-specific fields in `resource.json` and list every shipped package file.
4. Recompute each package file's size and SHA-256 after the final file edit. Recompute the preview and each additional screenshot SHA-256 too.
5. Validate the JSON against `catalog-index-v1.schema.json`, `resource.schema.json`, and the corresponding kind schema. Run the template build for a Site Hosting package.
6. Commit the complete package. Add its commit SHA and manifest path to `amade/catalog/index.json` in a subsequent commit, then validate the catalog again.
7. Review the license, package contents, file hashes, preview, and user-facing metadata on `dev`. After validation and approval, promote the package/catalog change to `main`.

### Resource update

- Published versions are immutable. Any change to source, customization behavior, publishing rules, preview, screenshots, or license creates a new `version` directory and updates the package manifest's hashes.
- On `dev`, commit the new package first, then point the catalog entry at that package commit and version. Validate through BlogGenius development before promoting the catalog update to `main`.
- Keep existing Sites on their copied source. Template upgrades and preserving hand-edited files during upgrades require a separate migration design.
- If the JSON contract itself changes incompatibly, publish a new `schema_version` and schema document; do not reinterpret old manifests in place. Update this guide, the root README, validation, and the BlogGenius consumer together where applicable.

## 8. Compatibility and v1 implementation boundary

The v1 schemas define the original versioned interchange format. BlogGenius currently consumes the public catalog, Site Hosting metadata/preview/package, checksum list, JSON customization targets for Site creation, and the declared post contract for template behavior. The BlogGenius publishing adapter is still follow-up work. It currently does not provide a full arbitrary Astro project importer UI, external Style selection, template upgrading, or post publishing into the declared content directory. Keep documentation explicit about these boundaries as implementation grows.


## Specification generations and current status

| Generation | Documents and resources | Status and use |
| --- | --- | --- |
| Legacy Amade resource format v1 | `resource.schema.json`, `catalog-index-v1.schema.json`, `site-hosting-v1.schema.json`, `bloggenius-style-v1.schema.json`; historical packages under `amade/templates/site-hosting/` | Historical package contract retained for reference. The dev catalog and BlogGenius development consumer now use 0.1. Its schemas must not be applied to 0.1 manifests. |
| Site Hosting Contract 0.2.0-dev1 | [`site-hosting-content-model-v0.2-design.md`](site-hosting-content-model-v0.2-design.md), `amade/catalog/index.json`, `amade/families/`, `amade/content-models/`, `amade/templates/` | Experimental role-separated contract being integrated on Amade `dev` and consumed by BlogGenius development. Family, Content Model, and Template `spec_version` plus Template `compatibility.contract.version` are one shared version. The catalog index format stays at `0.1.0`. |
| BlogGenius Style next generation | Not yet designed against the 0.1 family model | Deferred. The v1 Style schema remains a legacy format reference only. |

The original 0.1 proof had two families with two Astro templates each. Its historical A→B→A experiment verified the exact proof packages and unchanged data hashes; it does not establish a product guarantee that templates in one Family are interchangeable. Family is catalog/use-case grouping only. The current v0.2 role separation is documented in the linked design. Template manifests include required name/description/author/package version/license/categories/tags/representative preview/status; screenshots, homepage, and support are optional. The lifecycle values are `active`, `deprecated`, and `withdrawn`; current templates use `active`. Catalog status `experimental` is distinct from each template's lifecycle status.

Do not combine v1 and 0.1 manifests in one catalog or claim automatic compatibility. Keep the 0.1 spec experimental until the remaining negative/route-edge cases, formal JSON Schema, and BlogGenius materialization/filtering behavior are validated. Promote it to `1.0.0` only after that validation and an explicit spec decision.
