# Amade resource format v1

This document explains how to package and maintain resources published by Amade. The JSON Schemas in this directory are the machine-readable contract; this page explains their intent, file layout, and authoring workflow. Update this page in the same change whenever a schema or its supported behavior changes.

## 1. Resource model

Amade publishes two kinds of resources for BlogGenius:

- `site-hosting`: a complete, buildable Astro project used to create a new Site.
- `bloggenius-style`: a data-only appearance pack for `BlogGenius > Settings > App > Appearance`.

Both kinds share a catalog and common resource envelope. Their kind-specific configuration is kept separate. This lets BlogGenius discover both from Amade while each feature validates and consumes only its own data.

```text
Amade catalog index
  ├─ common resource metadata: id, kind, version, license, preview, compatibility, package files
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

The initial Site Hosting example is [`astro-homepage/1.0.0`](../templates/site-hosting/astro-homepage/1.0.0/README.md). [`studio-journal/1.0.0`](../templates/site-hosting/studio-journal/1.0.0/README.md) is a more complete, brand-neutral studio and editorial site informed by the StaticWeb Astro projects. Each resource includes a normal Astro project, preview, manifest, and MIT license files. Their manifests declare the BlogGenius customization and post-publishing contracts.

A Site Hosting resource contains the Astro project itself. It is not merely a screenshot or a link to another repository: BlogGenius copies the declared Astro source into a new Site so it can be edited, built, previewed, and deployed as an ordinary Astro project. Existing Astro projects can be used as a starting point for a package; remove personal data and secrets, decide which files are reusable, and declare only supported customization points.

## 3. Catalog index

`amade/catalog/index.json` is the entry point BlogGenius reads from the Amade `main` branch. It identifies the catalog and points to each active resource manifest.

Each catalog resource entry contains:

- `kind`: `site-hosting` or `bloggenius-style`.
- `id`: stable lowercase kebab-case identity for the resource.
- `version`: resource package version.
- `revision`: full 40-character Git commit SHA containing the manifest and package files.
- `manifest`: path to `resource.json` within that commit.

BlogGenius reads the catalog from `main`, then fetches the referenced manifest and files from the immutable `revision`. Therefore catalog updates can add a template without an app release, while a package fetch remains pinned to the exact commit chosen by the catalog.

For the initial BlogGenius consumer, keep one active catalog entry per `kind` and `id`. To release a replacement, bump the package version and update that entry's version and revision. Do not overwrite a published package version. Older revisions remain in Git history, and already-created Sites have their own copied source plus the selected source revision in their metadata.

## 4. Common resource manifest

Every resource has an `amade/templates/<kind>/<id>/<version>/resource.json` manifest validated by `resource.schema.json` and the appropriate kind schema.

| Field | Meaning |
| --- | --- |
| `schema_version` | Version of the common manifest shape; currently `1`. |
| `id`, `kind`, `version` | Stable identity, resource type, and immutable package version. |
| `name`, `description`, `maintainer` | User-facing metadata and maintainer attribution. |
| `license` | License identifier or clear license label for this package. Every resource chooses its own license. |
| `preview` | Preview file path, SHA-256, and optional media type. The preview is separate from the source package file list. |
| `compatibility` | Compatibility declarations such as Astro and BlogGenius versions. |
| `package.path` | Base directory for the package files. v1 templates use `.`. |
| `package.files[]` | Each package file's relative path, SHA-256, and optional byte size. |
| `site_hosting` | Required only for `kind: site-hosting`; points to `site-hosting-v1.schema.json`. |
| `bloggenius_style` | Required only for `kind: bloggenius-style`; points to `bloggenius-style-v1.schema.json`. |

The `preview.path` is relative to the directory containing `resource.json`; each `package.files[].path` is relative to `package.path`. In the current package layout, both happen to resolve under the version directory because `package.path` is `.`.

Paths must be relative and must not escape their declared base directory. SHA-256 is computed from the exact file bytes. `size`, when included, is the file length in bytes. Keep the manifest, preview, license, and all project files in the pinned revision.

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

Keep customizable values in a small, explicit config file instead of asking BlogGenius to rewrite arbitrary Astro/JavaScript source. In v1, `target` is limited to JSON paths, and unsupported `key` or `type` values must not be invented without a schema and consumer update. The current create flow applies declared defaults and records the values; a complete customization editor is a later feature.

### Future BlogGenius publishing contract

`site_hosting.publishing` declares:

- `content_directory`: relative to the Astro source; the first template uses `src/content/posts`.
- `route_pattern`: public article route; the first template uses `/blog/{slug}/`.
- `frontmatter`: fields required by the content collection; the first template uses `title`, `description`, and `pubDate`.

This gives a future BlogGenius publishing adapter an explicit destination and URL rule. BlogGenius does not yet publish written posts into these files; the current declaration is a contract for that follow-up, not evidence that article publishing is implemented.

## 6. BlogGenius Style contract

`bloggenius-style-v1.schema.json` describes a data-only pack for BlogGenius's existing appearance styles. It requires:

- `schema_version: 1` and `token_contract: bloggenius-style-tokens-1.0`.
- A stable `style_id`.
- Every required semantic CSS token value from the BlogGenius token contract; unknown token names are rejected by this schema.
- No arbitrary executable JavaScript or CSS package behavior in v1.

The required token list must remain synchronized with BlogGenius `DESIGN_STYLE_REQUIRED_TOKENS`. If that application contract changes, update the Amade Style schema and this guide together, then implement and verify the matching BlogGenius consumer before publishing a Style resource.

## 7. Adding or updating a resource

### New resource

1. Choose the kind, stable ID, version, license, and compatibility range.
2. For `site-hosting`, prepare a complete buildable Astro project and preview image. For `bloggenius-style`, supply the required token data and preview if available.
3. Write the kind-specific fields in `resource.json` and list every shipped package file.
4. Recompute each package file's size and SHA-256 after the final file edit. Recompute the preview SHA-256 too.
5. Validate the JSON against `catalog-index-v1.schema.json`, `resource.schema.json`, and the corresponding kind schema. Run the template build for a Site Hosting package.
6. Commit the complete package. Add its commit SHA and manifest path to `amade/catalog/index.json` in a subsequent commit, then validate the catalog again.
7. Review the license, package contents, file hashes, preview, and user-facing metadata; submit the change for maintainer review.

### Resource update

- Published versions are immutable. Any change to source, customization behavior, publishing rules, preview, or license creates a new `version` directory and updates the package manifest's hashes.
- Commit the new package first, then point the catalog entry at that package commit and version.
- Keep existing Sites on their copied source. Template upgrades and preserving hand-edited files during upgrades require a separate migration design.
- If the JSON contract itself changes incompatibly, publish a new `schema_version` and schema document; do not reinterpret old manifests in place. Update this guide, the root README, validation, and the BlogGenius consumer together where applicable.

## 8. Compatibility and current implementation boundary

The schemas define the intended versioned interchange format. BlogGenius currently consumes the public catalog, Site Hosting metadata/preview/package, checksum list, and JSON customization targets for Site creation. It currently does not provide a full arbitrary Astro project importer UI, external Style selection, template upgrading, or post publishing into the declared content directory. Keep documentation explicit about these boundaries as implementation grows.
