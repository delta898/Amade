# Amade Site Hosting Template Family Specification (Draft)

Status: experimental Site Hosting Contract `0.1.0-dev2`, integrated into the Amade `dev` catalog and BlogGenius development consumer for validation. Existing Amade `1.x` resources are legacy and are not compatible by version number or implication. This is not yet a stable production schema and is not published through the production `main` catalog.

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

`amade/catalog/index.json` is the shared discovery index. It groups Site Hosting `family_id` entries with an ordered list of their templates, and has a separate `styles[]` collection for BlogGenius UI Styles. The index owns membership and display order; names, descriptions, requirements, and other detailed metadata remain canonical in the referenced manifests. References are repository-root-relative and must begin under their matching `amade/families/`, `amade/templates/`, or `amade/styles/` directory. `catalog-index-v0.1.schema.json` validates the index, `site-hosting-family-v0.1.schema.json` validates family data contracts, and `site-hosting-template-v0.1.schema.json` validates selectable template manifests.

A consumer first reads the catalog index, then resolves the referenced package manifests (requests may be fetched concurrently). Manifest references are relative to the Amade repository root, may not escape it, and must point under the matching resource directory. It should pin all reads to the same immutable Amade revision so a catalog update cannot mix entries from different revisions. It validates that family IDs and template IDs match their manifest contents and that every listed template declares the containing `family_id`. Template Builder can enumerate families, inspect each family contract, and then enumerate available templates without inferring membership from directory names. BlogGenius can enumerate UI Styles independently of site templates.

## Shared selectable-package metadata and UI Styles

Selectable Site Hosting Templates and BlogGenius UI Styles use shared common metadata defined in `common-metadata-v0.1.schema.json`: `name`, `description`, `author`, package `version`, `license`, `created_at`, `categories`, `tags`, representative `preview`, optional `screenshots`, `homepage`, `support`, `status`, and required `compatibility`. Families remain grouping/data contracts, not selectable packages, and do not use this envelope.

Every selectable package must declare `compatibility.min_bloggenius_version` and `compatibility.contract.id` plus `compatibility.contract.version`. Current Site Hosting Templates require BlogGenius `0.6.0`. Their unified Site Hosting Contract Version is `0.1.0-dev2` and must be identical in Template `spec_version`, Family `content_contract_version`, and Template `compatibility.contract.version`; advance all three together whenever any of these contract areas changes. A template package's own `version` independently tracks that package's release. UI Styles remain on their separate `bloggenius-ui-style-tokens@1.0` contract. The minimum app version gates packages by BlogGenius release; malformed or inconsistent declarations are manifest errors.

UI Style packages live in `amade/styles/<style-id>/style.json` and are validated by `bloggenius-ui-style-v0.1.schema.json`. They carry a `style_id`, the UI Style contract declaration, and token values only. They do not carry CSS selectors, scripts, or arbitrary executable code. The catalog index and UI Style formats have their own versions; they are not part of the unified Site Hosting Contract Version.

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
- `compatibility.min_bloggenius_version`: required stable SemVer minimum BlogGenius app version (`0.6.0` for current packages; prerelease versions are not allowed).
- `compatibility.contract`: required `{ id, version }` identifying the BlogGenius integration contract. For Site Hosting Templates, `version` must equal the shared Site Hosting Contract Version `0.1.0-dev2`; UI Styles use their separate `bloggenius-ui-style-tokens@1.0` contract.

**Version approval rule:** Do not choose a future Site Hosting Contract Version autonomously. When a change requires a bump, explain why and ask the user for the exact version first. After the user chooses it, apply the same value to Template `spec_version`, Family `content_contract_version`, and Template `compatibility.contract.version`, then verify they match. The template package's own `version` is independent and must not be inferred from this shared contract version.

Preview and screenshot references must resolve to files included in the package. Categories and tags are discovery labels only; they do not grant capabilities or establish family compatibility. `version` changes when the template package is updated; it does not change the specification version.

### Lifecycle states

- `active`: Amade and consumers may offer the template for new Site creation.
- `deprecated`: do not offer it for new Site creation. Keep its manifest and package available so existing Sites can still identify the template and retrieve the pinned package when needed. Existing materialized Sites may continue to build. A replacement template may be named in an optional future field; no replacement field is required in 0.1.0.
- `withdrawn`: do not offer it for new Site creation and do not serve its package for new downloads, for example when distribution must stop. Existing Sites with a local materialized copy may continue to build; Amade does not promise package retrieval. Consumers should retain the state for existing references and explain that the source is unavailable if a rebuild needs to download it.

Consumers must filter `active` templates for new Site creation. They must not delete or invalidate an existing Site solely because its referenced template later becomes `deprecated` or `withdrawn`. A family with no `active` templates is omitted from new-Site selection, while its manifests may remain available for existing Site references and catalog history. The current 0.1 experiment uses `active` for all four validation templates; the `deprecated` and `withdrawn` states are specified but not currently exercised.

The catalog status (`experimental`) describes the maturity of the catalog/specification as a whole and is independent from each template's `status`. The following shows the 0.1.0 field shape; optional fields may be omitted when unavailable:

```json
{
  "spec_version": "0.1.0-dev2",
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
  "compatibility": {
    "min_bloggenius_version": "0.6.0",
    "contract": { "id": "bloggenius-site-hosting-template", "version": "0.1.0-dev2" }
  },
  "astro_project": "template/astro",
  "site_data": "../../site-data",
  "layout": "list"
}
```

## Site Hosting Contract 0.1.0-dev2 data contract (refined from the four-template proof)

This section records the currently tested contract shape, not a final compatibility guarantee. The family JSON files describe it for tools; the Astro collection schemas in every template enforce the content frontmatter rules during builds.

### Shared Site data

`site-data/site.json` is required and contains:

- `displayName`: required, non-empty string.
- `logo`: optional public URL path to a file under `site-data/public/` (the proof uses `/logo.svg`).
- `navigation`: required ordered array. Each item has a unique stable `id`, non-empty editable `label`, and `path`.
- Navigation `path` is a root-relative internal path. It must start with one `/`; external URLs, protocol-relative paths, query/fragment suffixes, backslashes, and `.`/`..` path segments are outside this contract. Nested paths are allowed and a multi-level path is built successfully. Unicode paths are syntactically accepted but emitted URL encoding is not verified. Exact URL normalization and collision behavior still need dedicated verification.
- Menu IDs are stable across label/path edits and template conversion. The prototype enforces unique lowercase kebab-case IDs; duplicate destination paths remain allowed pending a product decision.

The family-specific profile fields are required strings in this proof: Personal Homepage has `headline` and `biography`; Company Homepage has `tagline` and `about`. Both have the shared `displayName` and optional `logo`. The current Site Hosting Contract also defines optional `seoDescription` (up to 300 characters), `shareImage`, `favicon`, and `searchEngineIndexing` (default `true`). `seoDescription` and `shareImage` apply to the homepage and template-provided listing pages only; neither is a fallback for individual post metadata. `favicon` is separate from the site logo. When indexing is disabled, templates add `noindex, nofollow` to all pages; this does not make static URLs private.

### Manifest-declared setup inputs

`setup_inputs` declares extra user-supplied Site creation settings; consumers render supported input types from these declarations rather than inferring behavior from template names. Contract `0.1.0-dev2` supports:

| Type | Purpose | Site value | Behavior in this increment |
|---|---|---|---|
| `directory` | `knowledge_collection` | Absolute selected folder path | BlogGenius stores the selected Vault root in the Site manifest. |
| `frontmatter_match` | `publication_filter` | `{ "field": "is_public", "value": "true" }` | UI collects a frontmatter property and a match value and stores them alongside the Vault root. Both fields are required; an empty rule never means “publish all.” The conversion engine does not evaluate it in this increment. |

The frontmatter match UI uses exact-match intent with a text value. Source YAML type coercion and actual note filtering are not implemented or claimed here; define and validate those rules with future conversion-engine work before applying the saved setting to content.

### Markdown content and identity (Site Hosting Contract 0.1.0-dev2)

Markdown files are identified by safe source paths under `site-data/data/`; frontmatter is optional and extensible. No frontmatter field is universally required. If the frontmatter block is absent, the entry is still valid. The path supplies content kind and stable content ID; an optional `kind` must match that path. Unknown properties are preserved by Astro's content schema and ignored unless a future contract gives them meaning.

| Content | Storage and identity | Required frontmatter | Optional frontmatter | Default output behavior |
|---|---|---|---|---|
| Page | `pages/<id>.md`; filename stem is stable ID | None | `kind`, `title`, `path`, `is_public`, and user-defined metadata | `is_public` defaults to false. If `path` is absent, route is `/<id>/`. |
| Post | `posts/<slug>/index.md`; directory slug is stable ID | None | `kind`, `title`, `description`, optional `author`, `cover` (entry-relative local image), `cover_alt`, `date` (`YYYY-MM-DD`), `published_at` (ISO 8601 with explicit offset), `editorial_status`, `publication`, tags/categories, and any user-defined metadata | `publication` defaults to `none` (no output); `editorial_status` defaults to `draft`. |
| Work item (Personal Homepage) | `work/<slug>/index.md`; directory slug is stable ID | None | `kind`, `title`, `description`, `order`, `is_public`, and user-defined metadata | `is_public` defaults to false. |
| Service (Company Homepage) | `services/<slug>/index.md`; directory slug is stable ID | None | `kind`, `title`, `description`, `order`, `is_public`, and user-defined metadata | `is_public` defaults to false. |

Content ID path segments use lowercase ASCII letters, digits, and single hyphens between groups; they cannot start or end with a hyphen. Unsupported path shapes and an explicit `kind` that disagrees with the path remain errors. The family-specific Astro schemas validate known fields but use pass-through behavior for additional properties. Missing title falls back to the first Markdown H1, then to the path-derived slug. Missing description is omitted. Optional `author` is emitted as author metadata only when explicitly supplied. Invalid optional `date` and `published_at` values are ignored; invalid publication/editorial enum values remain errors.

For posts, `publication: none` stays in local Site data and emits no route; `private` emits a deployed detail route but is omitted from public listings; `public` emits and lists the route. Missing publication is equivalent to `none`. Direct URLs for `private` posts remain accessible. Public post lists sort descending by `published_at`, falling back to `date`, then ascending stable content ID for ties and entries without dates. `cover` is the optional representative-image source relative to the post file; BlogGenius writes the first image block there and copies its title to `cover_alt`. Astro consumes this value for list thumbnails and `og:image` when an absolute public site URL is known; a template never modifies the source Markdown. Each post detail title is `<post title> | <site displayName>`. A template must generate the same family routes and use the same slug identity as its siblings.

### Family-specific data

- **Personal Homepage:** `site-data/data/work/<slug>/index.md` is a public or private work item with title, description, optional order, Markdown body, and entry images. Both family templates must render work items and posts, even when one presentation emphasizes posts.
- **Company Homepage:** `site-data/data/services/<slug>/index.md` is a public or private service with title, description, optional order, Markdown body, and entry images. Both family templates must render services and posts/news.

Earlier independent content-contract revisions established the following behavior, now carried by the unified Site Hosting Contract `0.1.0-dev2`: path shape determines family content kind and stable ID; fields are optional; unknown frontmatter properties pass through without interpretation; site SEO fields are shared. Invalid explicit `kind` mismatches and invalid deployment enums remain errors. Positive fixtures pass across the four Homepage templates. Repeatable negative fixtures for malformed `site.json`, missing required values, and route collisions remain before the contract can be considered stable.

Verified route patterns are `/`, page paths from frontmatter (including `/about/team/`), `/blog/` and `/blog/{slug}/`, plus `/work/` and `/work/{slug}/` for Personal Homepage or `/services/` and `/services/{slug}/` for Company Homepage. The route patterns for posts and family-specific collections are shared by all templates in a family. Route collisions and canonical slash/Unicode normalization still need tests.

The test runner performs A→B→A builds by replacing the template project in one materialized Site root. Both families retained identical SHA-256 hashes for all nine fixture data/media files. All four Astro 7.3.5 templates rendered the same site-data navigation and generated public listings/details and the nested `/about/team/` page, applied publication/visibility rules, copied the family logo, and emitted entry-relative Markdown image assets. Loaders resolve `site-data/data/`, derive IDs from supported paths, and reject unsupported shapes or explicit kind mismatches. See `../experiments/site-hosting-family-v0.1/README.md` and its `scripts/build_and_verify.py`.

## Initial proof families and template examples

Names describe presentation so the difference is easy to understand. These are the first validation examples, not a final visual-design specification.

| Family | Template A | Template B | Shared data |
|---|---|---|---|
| Personal Homepage | Top navigation with a chronological post list | Top navigation with a card grid | Profile, pages, posts, work items, images |
| Company Homepage | Top navigation with service cards | Left navigation with a service list | Company profile, pages, services, news/posts, images |

Within each row, A and B must both preserve and render the entire shared data set. For example, the Personal Homepage list template must still make work items available even when its home page emphasizes posts; the Company Homepage card template must still display news/posts even when it emphasizes services.

Digital Garden is now an initial catalog family. Its first two templates use the same Knowledge Collection seed and place the directory explorer on opposite sides of the note reader. The Knowledge Collection is mounted at `/`. The current contract allows selecting and recording a Vault root; import policy, Obsidian conversion, and broader relationship rendering are later integration work.

## Family contract overview

The detailed paths, required and optional fields, visibility defaults, and current limits are specified above and represented in `families/<family-id>/family.json`. The family manifest's `spec_version`, the family's `content_contract_version`, and the template's `compatibility.contract.version` all use the unified Site Hosting Contract Version. Its JSON Schemas remain experimental and may change as Digital Garden support develops.

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
- `title`, `description`, optional `date`, `editorial_status` (`draft`/`complete`), and `publication` (`none`/`private`/`public`) define the 0.5.0 post contract.
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
- The initial isolated negative builds confirmed strict-schema behavior that was later superseded by contract 0.7.0; path and explicit kind mismatch checks remain.

Remaining before the format can be considered stable:

- Add repeatable checks for malformed `site.json`, unsupported content kind, explicit path/kind mismatch, and invalid path. Contract 0.7.0 explicitly permits absent/unknown frontmatter.
- Turn path/ID and explicit kind mismatch checks into repeatable fixtures; add malformed/missing `site.json` cases and positive fixtures for absent/unknown frontmatter.
- Define and test Unicode route output, reserved paths, duplicate/colliding routes, and optional-field edge cases.
- Verify that a failed conversion/build never replaces the last usable presentation or changes family data.
- Formalize JSON Schema for family and template manifests and run the contract through BlogGenius materialization.

Keep the spec experimental until these checks and remaining design decisions are resolved; promote the contract to `1.0.0` only after sufficient validation.

## Open decisions

- Full conformance validation of every family and template package against the JSON Schemas; the schemas are still experimental.
- Markdown/media edge cases and content-entry IDs beyond the tested fixtures.
- Slug syntax, nested paths, built-in collection routes and reserved-path/collision handling; page paths are stored as authored internal paths.
- Negative schema tests and failed-build recovery behavior during an actual template conversion.
- How BlogGenius detects user edits that a same-family conversion would replace.
- Existing 1.x resources remain legacy and are excluded from the isolated 0.1 experimental catalog; 0.1 lifecycle states govern only resources conforming to this new manifest format.
- Astro runtime compatibility declarations remain follow-up. BlogGenius app compatibility is required on both resource types: current packages target minimum BlogGenius `0.6.0` and declare their type-specific BlogGenius contract ID/version.

## 2026-10-05 — Initial Digital Garden catalog family

- The general content-kind vocabulary includes `page`, `post`, and `note`. Existing Homepage families retain their current `work`/`service` data for now; those remain family-specific examples and are not added to the general taxonomy.
- Added the `digital-garden` family and two active templates: left explorer/right reader and left reader/right explorer. Both mount the Knowledge Collection at `/` and begin with a small sample collection so their note routes and explorer layout are visible.
- Initial Garden modeling preceded the unified version decision. The current Digital Garden Family and all Homepage families use the shared Site Hosting Contract Version `0.1.0-dev2`; content is no longer versioned on an independent `0.7.x` line.
- Both Digital Garden template manifests declare a required `directory` input for the Knowledge Collection root and a required `frontmatter_match` input for publication selection. BlogGenius renders both declarations without branching on the template display name.
- BlogGenius saves the selected Vault root and the configured frontmatter property/value in the local Site manifest. This records setup only; import, conversion, publication filtering, build integration, and deployment remain follow-up work.
- Contract `0.1.0-dev2` keeps Template `spec_version`, Family `content_contract_version`, and Template `compatibility.contract.version` synchronized. These advance together; the template package's own release `version` remains separate.
- BlogGenius's current Site creation picker groups templates by Family metadata, so no new picker layout is needed. Vault-root selection is included in the current stage; conversion and publishing remain subsequent work, so this does not claim the whole-Vault publishing flow is ready.


### Historical version progression: independent content-contract 0.7.x (superseded)

These entries record the earlier development sequence. Their behavior is now included in the unified Site Hosting Contract `0.1.0-dev2`; do not use these historical numbers for current compatibility decisions.

## 2026-10-05 — Content contract 0.7.0: optional and extensible frontmatter

- User decision: no frontmatter field is universally required. The source path supplies stable content identity and kind; an optional `kind` must match the path.
- All four templates accept absent frontmatter, use optional known fields, preserve unknown frontmatter keys without interpreting them, and derive missing display titles from first H1 then path slug. Missing descriptions are omitted.
- `publication` defaults to `none`; posts without an explicit publication intent do not generate output. `editorial_status` defaults to `draft`; pages/work/services default to `is_public: false`.
- Invalid optional `date`/`published_at` values are ignored. Invalid enum values that affect deployment remain build errors.
- Existing materialized Sites keep their copied template version; consuming contract updates requires updating/recreating the template source.


## 2026-10-05 — Content contract 0.7.1: representative image

- Added optional post fields `cover` (entry-relative image path) and `cover_alt` (optional alternative text). BlogGenius records the first image block and its title when available.
- All four templates use `cover` for blog-list thumbnails and `og:image` / optional `og:image:alt`; they do not modify source frontmatter. Raster images are optimized, while SVG covers pass through as SVG.
- Both family manifests now declare content contract `0.7.1`; four packages advance to `0.4.4`. BlogGenius requires exact contract `0.7.1`.
- Build and verification use canonical Amade package and family sources, not stale duplicate experiment copies. Existing materialized Sites keep their copied template version and must be recreated or upgraded to consume it.


## 2026-10-05 — Content contract 0.7.2: shared Site SEO profile

- Added optional family profile fields `seoDescription` (maximum 300 characters), `shareImage`, `favicon`, and `searchEngineIndexing` (default `true`) to both families.
- All four template schemas accept the fields. Shared metadata output uses the site name in page titles and `og:site_name`, site description and representative image on the homepage/template-provided listing pages, favicon on all pages, and site-wide `noindex, nofollow` when indexing is disabled.
- Post-level description and cover remain independent: posts do not inherit the site description or representative image.
- Both families advance to content contract `0.7.2`; all four package manifests advance to `0.4.5` and require `bloggenius-site-hosting-template@0.7.2`.
- Site profile metadata is part of shared site data; same-family template changes retain it. Already materialized Sites retain their copied template and need explicit upgrade/recreation to get the metadata-rendering changes.
