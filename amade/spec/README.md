# Amade package formats

> This document and the `*-v1.schema.json` files describe the original Amade package format. They remain the reference for existing 1.x resources and the current legacy catalog integration, but they are **not** the contract for new Site Hosting templates.
>
> **Current experimental format:** Site Hosting Templates and BlogGenius UI Styles share the grouped catalog at `amade/catalog/index.json`, but use separate package schemas. This format starts at `0.1.0` and remains experimental until the packages and BlogGenius consumers have been validated together. The v1 material below is retained as a historical reference for legacy packages.

## Current 0.1 package layout

```text
amade/
  catalog/index.json                   # groups families/templates and UI styles
  families/<family-id>/family.json     # shared site data and content contract
  templates/<template-id>/template.json
  styles/<style-id>/style.json         # BlogGenius appearance tokens
  spec/
    common-metadata-v0.1.schema.json
    catalog-index-v0.1.schema.json
    site-hosting-family-v0.1.schema.json
    site-hosting-template-v0.1.schema.json
    bloggenius-ui-style-v0.1.schema.json
```

Each **Template** package and **UI Style** package shares user-facing metadata: name, description, author, package version, license, creation date, categories, tags, preview, optional screenshots, homepage, support, lifecycle status, and required BlogGenius compatibility. Families are grouping and content-contract definitions, not selectable packages, so their manifests do not use this common package metadata.

The catalog exposes `families[]` with their `templates[]`, and `styles[]` as a separate resource type. Site Hosting Templates contain a complete Astro project and reference a family data contract. UI Styles contain only token data for the versioned BlogGenius semantic token contract; they do not distribute executable JavaScript or arbitrary CSS. Consumers list only packages whose status is `active`. `deprecated` and `withdrawn` remain in the catalog for history and existing references but are not offered for new selection.

Both package kinds require `compatibility.min_bloggenius_version` and `compatibility.contract` (`id` plus `version`). The current experimental packages require BlogGenius `0.6.0`. Site Hosting Templates use `bloggenius-site-hosting-template` contract `0.4.0`; UI Styles use `bloggenius-ui-style-tokens` contract `1.0`. The Amade manifest shape remains `spec_version: 0.1.0`; current template packages are package version `0.4.0`. Amade's package `spec_version`, package release `version`, minimum BlogGenius app version, and type-specific BlogGenius contract version are separate axes. Consumers reject malformed declarations, do not offer resources requiring a newer app or unsupported contract, and preserve their fallback.

Validation and BlogGenius adoption status are tracked in the corresponding design record in the BlogGenius repository.

## Current Site Hosting post contract (0.4.0)

The canonical content rules live in each `amade/families/<family-id>/family.json`, under `content_contract_version` and the `post` entry in `content_types`. The family manifest is the source of truth; all four Astro templates validate and render the contract. BlogGenius consumes the selected Site's pinned family manifest rather than defining a competing schema.

Both current families store a post at `site-data/data/posts/<slug>/index.md`, with related images in the entry's `images/` directory. The Markdown body follows YAML frontmatter.

| Field | Requirement | Meaning / behavior |
|---|---|---|
| `kind` | Required; exactly `post` | Identifies the entry as a post. |
| `title` | Required non-empty string | Post title. |
| `description` | Required non-empty string | Summary used in public listings. |
| `date` | Optional valid `YYYY-MM-DD` date | Date associated with writing/content, not deployment time. BlogGenius may fill today's date on posting if absent. |
| `editorial_status` | Optional; defaults to `draft`; values: `draft`, `complete` | Writing completeness only. It does not affect build or publication eligibility. |
| `publication` | Optional; defaults to `none`; values: `none`, `private`, `public` | Deployment and listing instruction, independent of editorial status. |

Every combination is valid. `draft` + `public` is allowed: the author's explicit publication selection wins, and BlogGenius should warn that the text is marked incomplete. The two fields never constrain each other.

| `publication` | Local Site data | Build / deployed output | Public listing | Direct URL |
|---|---|---|---|---|
| `none` | Retained in `site-data/data/posts/` | Excluded from generated output and Worker deployment | Hidden | No generated page |
| `private` | Retained | Detail page is built and deployed | Hidden | Accessible if the URL is known |
| `public` | Retained | Detail page is built and deployed | Shown | Accessible |

`private` means unlisted, not access-controlled. Static output does not authenticate visitors; a direct link can expose the page. If access restriction is ever required, it needs an authentication/runtime design beyond this contract. `none` is the safe default so a locally saved post is not uploaded to the Worker by accident. A human may later edit the local Site data to `private` or `public` and rebuild/deploy.

BlogGenius's Site Hosting actions map as follows:

- **Temporary save:** write `editorial_status: complete` and `publication: none` into local Site data only. It remains available under `workspace/site-hosting/sites/<site>/` and is not included in Worker output.
- **Post now:** write `editorial_status: complete` and `publication: public`, fill `date` only if absent, then build and deploy the whole Site.
- **Scheduled post:** unsupported for Site Hosting for now; the option is disabled.

A successful deployment does not rewrite these fields. They express authoring state and desired publication behavior, not delivery outcome. BlogGenius records operation result, deployment time, and batch membership in its own publishing record; there is no `published` frontmatter value. Posts with `private` or `public` remain in future clean builds; changing to `none` and redeploying removes the page from Worker output. Editing/re-publishing an already posted item through BlogGenius remains outside its initial consumer scope.

A leading `# Title` supplied by BlogGenius's existing editor is parsed into `title` and removed from the stored body; human-authored files should keep title in frontmatter without duplicating it as a leading H1. Tags and categories remain user-owned and outside this shared contract. Page/work/service visibility fields remain `is_public`.

The prior experimental `status: draft | ready | published` proposal, the `editorial_status` + `publish` boolean model, and the earlier `pubDate`/`is_public` shape are superseded. This is not an automatic content migration. A consumer must support `bloggenius-site-hosting-template@0.4.0` before offering these packages.

## Legacy v1 reference

The sections below document the original package format and schemas. They do not define the 0.1 package or catalog contract.

This document preserves the v1 package layout, schema meanings, and authoring workflow. The JSON Schemas below are authoritative only for v1 manifests. Update this guide alongside a v1 schema or supported-behavior change. For new Site Hosting work on `dev`, follow the 0.1 family spec instead.

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
| Site Hosting Template Family 0.1.0 | [`site-hosting-family-v0.1-draft.md`](site-hosting-family-v0.1-draft.md), `amade/catalog/index.json`, `amade/families/`, `amade/templates/` | Experimental grouped catalog integrated on Amade `dev` and consumed by BlogGenius development. It defines `families[]`, family/template manifests, common metadata, lifecycle states, and durable `site-data/`. The experiment folder retains fixtures and verification scripts. |
| BlogGenius Style next generation | Not yet designed against the 0.1 family model | Deferred. The v1 Style schema remains a legacy format reference only. |

The 0.1 proof has two families with two Astro presentation templates each. It verifies A→B→A builds, lowercase ASCII content IDs, path/kind matching, nested internal page routes, and same-family data preservation. The four manifests include required name/description/author/package version/license/categories/tags/representative preview/status; screenshots, homepage, and support are optional. The lifecycle values are `active`, `deprecated`, and `withdrawn`; current proof templates use `active`. Its catalog status `experimental` is distinct from each template's lifecycle status.

Do not combine v1 and 0.1 manifests in one catalog or claim automatic compatibility. Keep the 0.1 spec experimental until the remaining negative/route-edge cases, formal JSON Schema, and BlogGenius materialization/filtering behavior are validated. Promote it to `1.0.0` only after that validation and an explicit spec decision.
