# Amade Site Hosting Template Family Specification 0.1.0 (Draft)

Status: experimental 0.1.0 specification, integrated into the Amade `dev` catalog and BlogGenius development consumer for validation. Existing Amade `1.x` resources are legacy and are not compatible by version number or implication. This is not yet a stable production schema and is not published through the production `main` catalog.

## Terms

- **Template Family (템플릿 계열):** a site-purpose group with one complete, shared site-data contract. Family identity is the boundary of the conversion promise.
- **Template (템플릿):** one runnable Astro project within a family. It presents the family's data using a particular page composition, navigation layout, and visual design.
- **Same-family conversion:** every template in a family must be convertible to every other template in that family while retaining all data defined by the family contract. A family is a compatibility contract, not just a catalog category.

A template may change how data is arranged and styled. It must not discard family data, change canonical content identity, or strand declared public routes. Data or behavior not supported by every family template must not be part of that family's promised core contract.

## Proven site-data boundary and file model

The 0.1 proof materializes a Site with durable family data beside replaceable Astro source:

```text
<site>/
  site-data/
    site.json                  # identity and editable navigation
    public/                    # stable site-level assets such as logo.svg
    data/
      pages/<id>.md
      posts/<slug>/index.md
      posts/<slug>/images/...
      work/<slug>/index.md     # Personal Homepage family
      services/<slug>/index.md # Company Homepage family
  template/astro/           # complete, replaceable Astro project
```

Astro content loaders read Markdown from `site-data/data/`; `publicDir` exposes `site-data/public/`. Templates must refer to this Site-level contract, never to a path inside the Amade repository. In `template.json`, `astro_project` is relative to the template package root; `site_data` is relative to that Astro project's root and describes the data path it expects after materialization. In `family.json`, `site_data_directory` is relative to the family package root and identifies the initial seed copied into the Site's `site-data/`. A same-family switch replaces `template/astro/` and retains `site-data/`. The proof does not yet define preservation of user edits inside the Astro source. Template `categories` and `tags` are discovery metadata, distinct from family data and do not imply conversion compatibility; their controlled vocabulary remains open. Template availability is controlled by the template manifest status; see the lifecycle rules below.

## Catalog discovery index

`amade/catalog/index.json` is the discovery index. It groups each available `family_id` with the path to its `family.json` contract and an ordered list of that family's `template_id` plus `template.json` paths. The index owns membership and display order; names, descriptions, requirements, and other detailed metadata remain canonical in the referenced manifests to avoid maintaining duplicate copies. References are repository-root-relative and must begin under `amade/families/` or `amade/templates/` respectively.

A consumer first reads the catalog index, then resolves the referenced family and template manifests (requests may be fetched concurrently). Manifest references are relative to the Amade repository root, may not escape it, and must point under the matching `families/` or `templates/` directory. It should pin all reads to the same immutable Amade revision so a catalog update cannot mix entries from different revisions. It validates that family IDs and template IDs match their manifest contents and that every listed template declares the containing `family_id`. Template Builder can enumerate families, inspect each family contract, and then enumerate available templates without inferring membership from directory names. The current catalog index is experimental; a formal JSON Schema and generated-index workflow remain future work.

```json
{
  "spec_version": "0.1.0",
  "status": "experimental",
  "families": [
    {
      "family_id": "personal-homepage",
  "manifest": "amade/families/personal-homepage/family.json",
      "templates": [
        {
          "template_id": "personal-post-list",
          "manifest": "amade/templates/personal-post-list/template.json"
        }
      ]
    }
  ]
}
```

The refined frontmatter and file identity rules are listed below. `family.json` records each family's fields; Astro/Zod schemas in each template enforce the content rules during builds. Each `family.json` must set `site_data_directory` to a safe relative path within the family package; this directory supplies the initial `site.json`, public assets, and content copied to the generated Site's durable `site-data/` root. Each `template.json` must set `astro_project` to a safe relative path to the complete Astro project within that template package (currently `astro`). A template's optional `site_data` path documents where the Astro project expects the generated Site data at build time; it is not a path into the Amade repository.

## Template metadata and lifecycle

Each `template.json` contains the following common metadata in addition to its technical fields (`spec_version`, IDs, Astro project/data paths, and presentation-specific configuration):

- `name`: required human-readable template name.
- `description`: required concise purpose/presentation summary.
- `author`: required creator or maintainer identifier.
- `version`: required template package version, separate from `spec_version`.
- `license`: required license identifier or declared license name.
- `categories`: required non-empty list of discovery purposes.
- `tags`: required list of descriptive discovery labels; may be empty when no useful tags exist.
- `preview`: required representative preview image path, relative to the template package root.
- `screenshots`: optional list of additional preview image paths, relative to the template package root.
- `homepage`: optional public template or creator homepage URL.
- `support`: optional support contact URL or `mailto:` URL.
- `status`: required lifecycle state: `active`, `deprecated`, or `withdrawn`.

Preview and screenshot references must resolve to files included in the package. Categories and tags are discovery labels only; they do not grant capabilities or establish family compatibility. `version` changes when the template package is updated; it does not change the specification version.

### Lifecycle states

- `active`: Amade and consumers may offer the template for new Site creation.
- `deprecated`: do not offer it for new Site creation. Keep its manifest and package available so existing Sites can still identify the template and retrieve the pinned package when needed. Existing materialized Sites may continue to build. A replacement template may be named in an optional future field; no replacement field is required in 0.1.0.
- `withdrawn`: do not offer it for new Site creation and do not serve its package for new downloads, for example when distribution must stop. Existing Sites with a local materialized copy may continue to build; Amade does not promise package retrieval. Consumers should retain the state for existing references and explain that the source is unavailable if a rebuild needs to download it.

Consumers must filter `active` templates for new Site creation. They must not delete or invalidate an existing Site solely because its referenced template later becomes `deprecated` or `withdrawn`. A family with no `active` templates is omitted from new-Site selection, while its manifests may remain available for existing Site references and catalog history. The current 0.1 experiment uses `active` for all four validation templates; the `deprecated` and `withdrawn` states are specified but not currently exercised.

The catalog status (`experimental`) describes the maturity of the catalog/specification as a whole and is independent from each template's `status`. The following shows the 0.1.0 field shape; optional fields may be omitted when unavailable:

```json
{
  "spec_version": "0.1.0",
  "template_id": "personal-post-list",
  "family_id": "personal-homepage",
  "name": "상단 메뉴 · 글 목록형",
  "description": "개인 홈페이지의 글과 작업을 시간 순서 목록으로 보여주는 템플릿입니다.",
  "author": "amadejjs",
  "version": "0.1.0",
  "license": "MIT",
  "categories": ["Personal Website", "Blog"],
  "tags": ["Top Navigation", "Chronological List"],
  "preview": "preview.png",
  "screenshots": ["screenshots/full-page.png"],
  "homepage": "https://www.bloggenius.kr",
  "support": "mailto:amadejjs@naver.com",
  "status": "active",
  "astro_project": "template/astro",
  "site_data": "../../site-data",
  "layout": "list"
}
```

## 0.1.0 family data contract (refined from the four-template proof)

This section records the currently tested contract shape, not a final compatibility guarantee. The family JSON files describe it for tools; the Astro collection schemas in every template enforce the content frontmatter rules during builds.

### Shared Site data

`site-data/site.json` is required and contains:

- `displayName`: required, non-empty string.
- `logo`: optional public URL path to a file under `site-data/public/` (the proof uses `/logo.svg`).
- `navigation`: required ordered array. Each item has a unique stable `id`, non-empty editable `label`, and `path`.
- Navigation `path` is a root-relative internal path. It must start with one `/`; external URLs, protocol-relative paths, query/fragment suffixes, backslashes, and `.`/`..` path segments are outside this contract. Nested paths are allowed and a multi-level path is built successfully. Unicode paths are syntactically accepted but emitted URL encoding is not verified. Exact URL normalization and collision behavior still need dedicated verification.
- Menu IDs are stable across label/path edits and template conversion. The prototype enforces unique lowercase kebab-case IDs; duplicate destination paths remain allowed pending a product decision.

The family-specific profile fields are required strings in this proof: Personal Homepage has `headline` and `biography`; Company Homepage has `tagline` and `about`. Both have the shared `displayName` and optional `logo`.

### Markdown content and identity

All content bodies are Markdown. Identity comes from the stable path within `site-data/data/`, rather than a separate frontmatter ID:

| Content | Storage and identity | Required frontmatter | Optional frontmatter | Public URL |
|---|---|---|---|---|
| Page | `pages/<id>.md`; `<id>` is its stable file ID | `kind: page`, `title`, `path` | `is_public` (defaults to `false`) | `path` is a root-relative internal URL; nested paths are supported |
| Post | `posts/<slug>/index.md`; directory slug is stable | `kind: post`, `title`, `description`, `pubDate` | `is_public` (defaults to `false`) | `/blog/` and `/blog/<slug>/` |
| Work item (Personal Homepage only) | `work/<slug>/index.md`; directory slug is stable | `kind: work`, `title`, `description` | `order` (non-negative integer), `is_public` (defaults to `false`) | `/work/` and `/work/<slug>/` |
| Service (Company Homepage only) | `services/<slug>/index.md`; directory slug is stable | `kind: service`, `title`, `description` | `order` (non-negative integer), `is_public` (defaults to `false`) | `/services/` and `/services/<slug>/` |

`kind` is required and must match its family. Content IDs (page filename stems and collection directory slugs) use lowercase ASCII letters, digits, and single hyphens between groups; they cannot start or end with a hyphen. Template loaders validate both the path shape and its matching `kind`. User-facing titles remain Unicode. Unknown frontmatter properties are rejected by the current strict Astro schemas. A missing `is_public` means private; only `true` entries generate public listing/detail output. Post dates use Astro/Zod date coercion. Route collisions and whether built-in paths remain customizable are still open. A template must generate the same family routes and use the same slug identity as its siblings.

Images referenced by Markdown live in that entry's sibling `images/` directory and use entry-relative paths such as `./images/photo.svg`. Site-level logos live under `site-data/public/` and use a root-relative public URL. The proof validates an SVG; accepted production image formats, size limits, and broken-reference diagnostics remain to be specified.

### Family-specific data

- **Personal Homepage:** `site-data/data/work/<slug>/index.md` is a public or private work item with title, description, optional order, Markdown body, and entry images. Both family templates must render work items and posts, even when one presentation emphasizes posts.
- **Company Homepage:** `site-data/data/services/<slug>/index.md` is a public or private service with title, description, optional order, Markdown body, and entry images. Both family templates must render services and posts/news.

The four template builds now use family-specific discriminated frontmatter schemas: personal templates accept `page`, `post`, and `work`; company templates accept `page`, `post`, and `service`. Required/optional fields and defaults above are enforced; unknown frontmatter properties are rejected. This prevents a template from silently accepting the other family's content type. Positive fixtures pass across the four templates; scratch negative builds confirmed that unknown fields, non-canonical IDs, and path/kind mismatches are rejected. Repeatable negative fixtures for malformed `site.json`, missing required values, and route collisions remain before the contract can be considered stable.

Verified route patterns are `/`, page paths from frontmatter (including `/about/team/`), `/blog/` and `/blog/{slug}/`, plus `/work/` and `/work/{slug}/` for Personal Homepage or `/services/` and `/services/{slug}/` for Company Homepage. The route patterns for posts and family-specific collections are shared by all templates in a family. Route collisions and canonical slash/Unicode normalization still need tests.

The test runner performs A→B→A builds by replacing the template project in one materialized Site root. Both families retained identical SHA-256 hashes for all nine fixture data/media files. All four Astro 7.3.5 templates rendered the same site-data navigation and generated public listings/details and the nested `/about/team/` page, omitted private entries, copied the family logo, and emitted entry-relative Markdown image assets. Loaders resolve `site-data/data/` and reject file paths whose shape or `kind` does not match the family content contract. See `../experiments/site-hosting-family-v0.1/README.md` and its `scripts/build_and_verify.py`.

## Initial proof families and template examples

Names describe presentation so the difference is easy to understand. These are the first validation examples, not a final visual-design specification.

| Family | Template A | Template B | Shared data |
|---|---|---|---|
| Personal Homepage | Top navigation with a chronological post list | Top navigation with a card grid | Profile, pages, posts, work items, images |
| Company Homepage | Top navigation with service cards | Left navigation with a service list | Company profile, pages, services, news/posts, images |

Within each row, A and B must both preserve and render the entire shared data set. For example, the Personal Homepage list template must still make work items available even when its home page emphasizes posts; the Company Homepage card template must still display news/posts even when it emphasizes services.

Digital Garden is a separate future family candidate because persistent note relationships/backlinks may require a different data contract from a personal homepage.

## Family contract overview

The detailed paths, required and optional fields, visibility defaults, and current limits are specified above and represented in `families/<family-id>/family.json`. A formal JSON Schema for `family.json` is not implemented yet.

## Candidate public routes for the proof

- Home: `/`
- Pages: stable internal paths stored with site data.
- Personal work list/detail: `/work/` and `/work/{slug}/`.
- Company service list/detail: `/services/` and `/services/{slug}/`.
- Posts/news list/detail: `/blog/` and `/blog/{slug}/`.

These route patterns are provisional. The proof must decide whether each family fixes these routes or permits Site-level path configuration. Both templates in a family must generate the same canonical paths.

## Legacy behavior worth reusing

The current `1.x` resources are legacy, but their independently verified behavior is useful evidence:

- A Markdown post can be a per-entry directory with `index.md` and a sibling `images/` directory using entry-relative references.
- `title`, `description`, and `pubDate` are useful post fields; `is_public` can control public output and default to private.
- Astro builds can verify listing/detail routes, public filtering, and image URLs.
- Immutable package revisions, checksums, author/license attribution, and representative preview media are useful package practices.

The new specification must restate any retained rule; no `1.x` schema or package is implicitly compatible.

## 0.1 validation gate

### BlogGenius development integration checkpoint (2026-10-04)

Amade's local `dev` checkout now has the canonical grouped 0.1 catalog and all four canonical template packages. BlogGenius's local development branch reads `families[]`, pins a single catalog revision, validates repository-root-relative family/template references, discovers family/template metadata, prepares packages, and materializes the selected Astro project beside `site-data/`. A local-fixture transport through the actual BlogGenius reader prepared and copied all four templates. The focused BlogGenius catalog/repository/service tests passed (23/23), the nested Astro build runtime test passed (1/1), and the complete six-build A→B→A proof plus four artifact verifiers passed. No UI/browser smoke was run. These changes are local and have not yet been pushed to Amade's remote `dev` branch; remote discovery remains for hands-on testing after publication.

Completed in the current proof:

- Built all four Astro projects from one fixture per family using the materialized `site-data/` and `template/astro/` boundary.
- Verified the fixture's profile, logo, full navigation, nested authored page, public/private post, family-specific content, listing/detail routes, and entry-relative images in each template.
- Ran A → B → A per family and confirmed all nine family data/media file hashes stayed identical.
- Added strict per-family content schemas and Site JSON validation; all valid fixtures build successfully.
- Confirmed through isolated negative builds that unknown frontmatter, non-canonical IDs, and mismatched path/kind are rejected.

Remaining before the format can be considered stable:

- Add negative cases for malformed `site.json`, missing/unknown frontmatter, unsupported content kind, and invalid path.
- Turn the negative checks for IDs, path/kind, and unknown frontmatter into repeatable fixtures; add malformed/missing `site.json` cases.
- Define and test Unicode route output, reserved paths, duplicate/colliding routes, and optional-field edge cases.
- Verify that a failed conversion/build never replaces the last usable presentation or changes family data.
- Formalize JSON Schema for family and template manifests and run the contract through BlogGenius materialization.

Keep the spec experimental until these checks and remaining design decisions are resolved; promote the contract to `1.0.0` only after sufficient validation.

## Open decisions

- Full JSON Schema validation for family and template manifests; current manifests and lifecycle/asset checks are repeatable proof validation, not a finalized schema.
- Markdown/media edge cases and content-entry IDs beyond the tested fixtures.
- Slug syntax, nested paths, built-in collection routes and reserved-path/collision handling; page paths are stored as authored internal paths.
- Negative schema tests and failed-build recovery behavior during an actual template conversion.
- How BlogGenius detects user edits that a same-family conversion would replace.
- Existing 1.x resources remain legacy and are excluded from the isolated 0.1 experimental catalog; 0.1 lifecycle states govern only resources conforming to this new manifest format.
- Compatibility declarations for Astro and BlogGenius, including whether explicit minimum BlogGenius app versions are needed.
